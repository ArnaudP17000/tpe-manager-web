#!/usr/bin/env python3
"""
Script pour créer un utilisateur administrateur
Usage: python create_admin.py
"""

import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, init_db
import crud
import schemas


def create_admin():
    """Créer un utilisateur administrateur"""
    print("=== TPE Manager - Création d'administrateur ===\n")
    
    # Initialiser la base de données
    init_db()
    
    # Obtenir une session
    db = SessionLocal()
    
    try:
        # Demander les informations
        username = input("Username: ").strip()
        if not username:
            print("❌ Username requis")
            return
        
        # Vérifier si l'utilisateur existe déjà
        existing_user = crud.get_user_by_username(db, username)
        if existing_user:
            print(f"❌ L'utilisateur '{username}' existe déjà")
            return
        
        email = input("Email (optionnel): ").strip() or None
        if email:
            existing_email = crud.get_user_by_email(db, email)
            if existing_email:
                print(f"❌ L'email '{email}' est déjà utilisé")
                return
        
        password = input("Password: ").strip()
        if not password or len(password) < 6:
            print("❌ Le mot de passe doit contenir au moins 6 caractères")
            return
        
        # Créer l'utilisateur
        admin_data = schemas.UserCreate(
            username=username,
            email=email,
            password=password,
            role="admin"
        )
        
        user = crud.create_user(db, admin_data)
        print(f"\n✓ Administrateur créé avec succès!")
        print(f"  - Username: {user.username}")
        print(f"  - Email: {user.email or 'N/A'}")
        print(f"  - Role: {user.role}")
        
    except Exception as e:
        print(f"\n❌ Erreur: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
