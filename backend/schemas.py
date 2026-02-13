from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: str = Field(default="user", pattern="^(admin|user)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = Field(None, pattern="^(admin|user)$")
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# Merchant Card Schema
class MerchantCard(BaseModel):
    numero: str = Field(..., description="Numéro de carte commerçant")
    numero_serie_tpe: str = Field(..., description="Numéro de série du TPE")


# TPE Schemas
class TPEBase(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=200)
    shop_id: Optional[str] = Field(None, max_length=50)
    
    # Régisseur
    regisseur_prenom: Optional[str] = Field(None, max_length=100)
    regisseur_nom: Optional[str] = Field(None, max_length=100)
    regisseur_telephone: Optional[str] = Field(None, max_length=20)
    regisseurs_suppleants: Optional[str] = None
    
    # Cartes commerçants
    merchant_cards: List[MerchantCard] = Field(default_factory=list, max_length=8)
    
    # Modèle TPE
    tpe_model: Optional[str] = Field(None, pattern="^(Ingenico Desk 5000|Ingenico Move 5000)$")
    number_of_tpe: int = Field(default=1, ge=1)
    
    # Connexions
    connection_ethernet: bool = False
    connection_4g5g: bool = False
    
    # Configuration réseau
    network_ip_address: Optional[str] = None
    network_mask: Optional[str] = None
    network_gateway: Optional[str] = None
    
    # Backoffice
    backoffice_active: bool = False
    backoffice_email: Optional[EmailStr] = None


class TPECreate(TPEBase):
    pass


class TPEUpdate(BaseModel):
    service_name: Optional[str] = Field(None, min_length=1, max_length=200)
    shop_id: Optional[str] = Field(None, max_length=50)
    regisseur_prenom: Optional[str] = Field(None, max_length=100)
    regisseur_nom: Optional[str] = Field(None, max_length=100)
    regisseur_telephone: Optional[str] = Field(None, max_length=20)
    regisseurs_suppleants: Optional[str] = None
    merchant_cards: Optional[List[MerchantCard]] = Field(None, max_length=8)
    tpe_model: Optional[str] = Field(None, pattern="^(Ingenico Desk 5000|Ingenico Move 5000)$")
    number_of_tpe: Optional[int] = Field(None, ge=1)
    connection_ethernet: Optional[bool] = None
    connection_4g5g: Optional[bool] = None
    network_ip_address: Optional[str] = None
    network_mask: Optional[str] = None
    network_gateway: Optional[str] = None
    backoffice_active: Optional[bool] = None
    backoffice_email: Optional[EmailStr] = None


class TPE(TPEBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Statistics Schema
class TPEStats(BaseModel):
    total: int
    desk_count: int
    move_count: int
    ethernet_count: int
    mobile_count: int
    backoffice_active_count: int


# Pagination Schema
class PaginatedTPE(BaseModel):
    items: List[TPE]
    total: int
    page: int
    page_size: int
    total_pages: int
