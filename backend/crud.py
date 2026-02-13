from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import models
import schemas
from auth import get_password_hash


# User CRUD operations
def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Récupérer un utilisateur par nom d'utilisateur"""
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Récupérer un utilisateur par email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Récupérer tous les utilisateurs"""
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Créer un nouvel utilisateur"""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Mettre à jour un utilisateur"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Hash le nouveau mot de passe si fourni
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Supprimer un utilisateur"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


# TPE CRUD operations
def get_tpe(db: Session, tpe_id: int) -> Optional[models.TPE]:
    """Récupérer un TPE par ID"""
    return db.query(models.TPE).filter(models.TPE.id == tpe_id).first()


def get_tpe_by_shop_id(db: Session, shop_id: str) -> Optional[models.TPE]:
    """Récupérer un TPE par ShopID"""
    return db.query(models.TPE).filter(models.TPE.shop_id == shop_id).first()


def get_tpes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tpe_model: Optional[str] = None,
    connection_type: Optional[str] = None
) -> tuple[List[models.TPE], int]:
    """Récupérer les TPE avec filtres et pagination"""
    query = db.query(models.TPE)
    
    # Filtre de recherche (service_name ou shop_id)
    if search:
        query = query.filter(
            or_(
                models.TPE.service_name.ilike(f"%{search}%"),
                models.TPE.shop_id.ilike(f"%{search}%")
            )
        )
    
    # Filtre par modèle
    if tpe_model:
        query = query.filter(models.TPE.tpe_model == tpe_model)
    
    # Filtre par type de connexion
    if connection_type == "ethernet":
        query = query.filter(models.TPE.connection_ethernet == True)
    elif connection_type == "4g5g":
        query = query.filter(models.TPE.connection_4g5g == True)
    
    # Compter le total
    total = query.count()
    
    # Appliquer la pagination
    tpes = query.offset(skip).limit(limit).all()
    
    return tpes, total


def create_tpe(db: Session, tpe: schemas.TPECreate) -> models.TPE:
    """Créer un nouveau TPE"""
    # Convertir les merchant_cards en dict pour JSON
    merchant_cards_dict = [card.dict() for card in tpe.merchant_cards]
    
    db_tpe = models.TPE(
        service_name=tpe.service_name,
        shop_id=tpe.shop_id,
        regisseur_prenom=tpe.regisseur_prenom,
        regisseur_nom=tpe.regisseur_nom,
        regisseur_telephone=tpe.regisseur_telephone,
        regisseurs_suppleants=tpe.regisseurs_suppleants,
        merchant_cards=merchant_cards_dict,
        tpe_model=tpe.tpe_model,
        number_of_tpe=tpe.number_of_tpe,
        connection_ethernet=tpe.connection_ethernet,
        connection_4g5g=tpe.connection_4g5g,
        network_ip_address=tpe.network_ip_address,
        network_mask=tpe.network_mask,
        network_gateway=tpe.network_gateway,
        backoffice_active=tpe.backoffice_active,
        backoffice_email=tpe.backoffice_email
    )
    
    # Générer un ShopID si non fourni
    if not db_tpe.shop_id:
        db_tpe.generate_shop_id()
    
    db.add(db_tpe)
    db.commit()
    db.refresh(db_tpe)
    return db_tpe


def update_tpe(db: Session, tpe_id: int, tpe_update: schemas.TPEUpdate) -> Optional[models.TPE]:
    """Mettre à jour un TPE"""
    db_tpe = db.query(models.TPE).filter(models.TPE.id == tpe_id).first()
    if not db_tpe:
        return None
    
    update_data = tpe_update.dict(exclude_unset=True)
    
    # Convertir les merchant_cards si présentes
    if "merchant_cards" in update_data and update_data["merchant_cards"]:
        update_data["merchant_cards"] = [card.dict() for card in tpe_update.merchant_cards]
    
    for field, value in update_data.items():
        setattr(db_tpe, field, value)
    
    db.commit()
    db.refresh(db_tpe)
    return db_tpe


def delete_tpe(db: Session, tpe_id: int) -> bool:
    """Supprimer un TPE"""
    db_tpe = db.query(models.TPE).filter(models.TPE.id == tpe_id).first()
    if not db_tpe:
        return False
    
    db.delete(db_tpe)
    db.commit()
    return True


def get_tpe_stats(db: Session) -> dict:
    """Obtenir les statistiques des TPE"""
    total = db.query(models.TPE).count()
    desk_count = db.query(models.TPE).filter(models.TPE.tpe_model == "Ingenico Desk 5000").count()
    move_count = db.query(models.TPE).filter(models.TPE.tpe_model == "Ingenico Move 5000").count()
    ethernet_count = db.query(models.TPE).filter(models.TPE.connection_ethernet == True).count()
    mobile_count = db.query(models.TPE).filter(models.TPE.connection_4g5g == True).count()
    backoffice_active_count = db.query(models.TPE).filter(models.TPE.backoffice_active == True).count()
    
    return {
        "total": total,
        "desk_count": desk_count,
        "move_count": move_count,
        "ethernet_count": ethernet_count,
        "mobile_count": mobile_count,
        "backoffice_active_count": backoffice_active_count
    }
