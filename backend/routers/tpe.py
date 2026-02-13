from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import schemas
import crud
import auth
import models
from openpyxl import Workbook
from io import BytesIO
from datetime import datetime
import math

router = APIRouter(prefix="/api/tpe", tags=["tpe"])


@router.get("/", response_model=schemas.PaginatedTPE)
async def get_tpes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by service name or ShopID"),
    tpe_model: Optional[str] = Query(None, description="Filter by TPE model"),
    connection_type: Optional[str] = Query(None, description="Filter by connection type (ethernet/4g5g)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Récupérer tous les TPE avec pagination et filtres"""
    skip = (page - 1) * page_size
    
    tpes, total = crud.get_tpes(
        db,
        skip=skip,
        limit=page_size,
        search=search,
        tpe_model=tpe_model,
        connection_type=connection_type
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": tpes,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/stats/summary", response_model=schemas.TPEStats)
async def get_tpe_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtenir les statistiques des TPE"""
    stats = crud.get_tpe_stats(db)
    return stats


@router.get("/export/excel")
async def export_tpes_to_excel(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Exporter tous les TPE vers Excel"""
    tpes, _ = crud.get_tpes(db, skip=0, limit=10000)
    
    # Créer un classeur Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "TPE List"
    
    # En-têtes
    headers = [
        "ID", "Service Name", "ShopID", "Régisseur Prénom", "Régisseur Nom",
        "Régisseur Téléphone", "Régisseurs Suppléants", "Modèle TPE",
        "Nombre de TPE", "Connexion Ethernet", "Connexion 4G/5G",
        "IP Address", "Mask", "Gateway", "Backoffice Actif",
        "Backoffice Email", "Date de création"
    ]
    ws.append(headers)
    
    # Données
    for tpe in tpes:
        merchant_cards_str = "; ".join([
            f"{card.get('numero', '')} ({card.get('numero_serie_tpe', '')})"
            for card in tpe.merchant_cards
        ]) if tpe.merchant_cards else ""
        
        ws.append([
            tpe.id,
            tpe.service_name,
            tpe.shop_id,
            tpe.regisseur_prenom or "",
            tpe.regisseur_nom or "",
            tpe.regisseur_telephone or "",
            tpe.regisseurs_suppleants or "",
            tpe.tpe_model or "",
            tpe.number_of_tpe,
            "Oui" if tpe.connection_ethernet else "Non",
            "Oui" if tpe.connection_4g5g else "Non",
            tpe.network_ip_address or "",
            tpe.network_mask or "",
            tpe.network_gateway or "",
            "Oui" if tpe.backoffice_active else "Non",
            tpe.backoffice_email or "",
            tpe.created_at.strftime("%Y-%m-%d %H:%M:%S") if tpe.created_at else ""
        ])
    
    # Sauvegarder dans un buffer
    excel_buffer = BytesIO()
    wb.save(excel_buffer)
    excel_buffer.seek(0)
    
    # Nom du fichier avec timestamp
    filename = f"tpe_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{tpe_id}", response_model=schemas.TPE)
async def get_tpe(
    tpe_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Récupérer un TPE par ID"""
    tpe = crud.get_tpe(db, tpe_id=tpe_id)
    if not tpe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="TPE not found"
        )
    return tpe


@router.post("/", response_model=schemas.TPE, status_code=status.HTTP_201_CREATED)
async def create_tpe(
    tpe: schemas.TPECreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Créer un nouveau TPE"""
    # Vérifier si le ShopID existe déjà
    if tpe.shop_id:
        existing_tpe = crud.get_tpe_by_shop_id(db, shop_id=tpe.shop_id)
        if existing_tpe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ShopID already exists"
            )
    
    # Valider les cartes commerçants (max 8)
    if len(tpe.merchant_cards) > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 8 merchant cards allowed"
        )
    
    return crud.create_tpe(db=db, tpe=tpe)


@router.put("/{tpe_id}", response_model=schemas.TPE)
async def update_tpe(
    tpe_id: int,
    tpe_update: schemas.TPEUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Mettre à jour un TPE"""
    # Vérifier si le ShopID existe déjà (si modifié)
    if tpe_update.shop_id:
        existing_tpe = crud.get_tpe_by_shop_id(db, shop_id=tpe_update.shop_id)
        if existing_tpe and existing_tpe.id != tpe_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ShopID already exists"
            )
    
    # Valider les cartes commerçants (max 8)
    if tpe_update.merchant_cards and len(tpe_update.merchant_cards) > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 8 merchant cards allowed"
        )
    
    db_tpe = crud.update_tpe(db, tpe_id=tpe_id, tpe_update=tpe_update)
    if not db_tpe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="TPE not found"
        )
    return db_tpe


@router.delete("/{tpe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tpe(
    tpe_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Supprimer un TPE"""
    success = crud.delete_tpe(db, tpe_id=tpe_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="TPE not found"
        )
