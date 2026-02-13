from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from database import Base
import uuid


class User(Base):
    """Modèle utilisateur pour l'authentification"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # admin ou user
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TPE(Base):
    """Modèle TPE (Terminal de Paiement Électronique)"""
    __tablename__ = "tpes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Informations de base
    service_name = Column(String(200), nullable=False, index=True)
    shop_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Régisseur principal
    regisseur_prenom = Column(String(100))
    regisseur_nom = Column(String(100))
    regisseur_telephone = Column(String(20))
    
    # Régisseurs suppléants (texte libre)
    regisseurs_suppleants = Column(Text, nullable=True)
    
    # Cartes commerçants (stockées en JSON pour flexibilité)
    # Format: [{"numero": "123", "numero_serie_tpe": "ABC"}, ...]
    merchant_cards = Column(JSON, default=list)
    
    # Modèle TPE
    tpe_model = Column(String(100))  # "Ingenico Desk 5000" ou "Ingenico Move 5000"
    
    # Nombre de TPE
    number_of_tpe = Column(Integer, default=1)
    
    # Types de connexion (peuvent être multiples)
    connection_ethernet = Column(Boolean, default=False)
    connection_4g5g = Column(Boolean, default=False)
    
    # Configuration réseau (si Ethernet)
    network_ip_address = Column(String(45), nullable=True)  # IPv4 ou IPv6
    network_mask = Column(String(45), nullable=True)
    network_gateway = Column(String(45), nullable=True)
    
    # Accès backoffice
    backoffice_active = Column(Boolean, default=False)
    backoffice_email = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def generate_shop_id(self):
        """Génère un ShopID unique si non fourni"""
        if not self.shop_id:
            self.shop_id = f"SHOP-{uuid.uuid4().hex[:8].upper()}"
