from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import time

from config import get_settings
from database import get_db, init_db
import models
import crud
import schemas
from routers import auth as auth_router
from routers import users as users_router
from routers import tpe as tpe_router
from auth import get_password_hash

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    print("Starting up TPE Manager API...")
    init_db()
    
    # Créer les utilisateurs par défaut
    db = next(get_db())
    try:
        # Vérifier si l'admin existe
        admin_user = crud.get_user_by_username(db, "admin")
        if not admin_user:
            admin_data = schemas.UserCreate(
                username="admin",
                email="admin@example.com",
                password="admin123",
                role="admin"
            )
            crud.create_user(db, admin_data)
            print("✓ Admin user created (username: admin, password: admin123)")
        
        # Vérifier si l'utilisateur standard existe
        regular_user = crud.get_user_by_username(db, "user")
        if not regular_user:
            user_data = schemas.UserCreate(
                username="user",
                email="user@example.com",
                password="user123",
                role="user"
            )
            crud.create_user(db, user_data)
            print("✓ Regular user created (username: user, password: user123)")
    finally:
        db.close()
    
    print("✓ Database initialized")
    print("✓ API ready")
    
    yield
    
    # Shutdown
    print("Shutting down TPE Manager API...")


# Créer l'application FastAPI
app = FastAPI(
    title="TPE Manager API",
    description="API pour la gestion des Terminaux de Paiement Électronique (TPE)",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(tpe_router.router)


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "message": "TPE Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Vérifier la connexion à la base de données
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": time.time()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
