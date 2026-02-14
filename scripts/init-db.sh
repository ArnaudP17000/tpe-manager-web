#!/bin/bash

# Script d'initialisation de la base de données
echo "Waiting for database to be ready..."

# Attendre que PostgreSQL soit prêt
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - initializing database"

# Exécuter les migrations Alembic si nécessaire
# cd /app/backend && alembic upgrade head

echo "Database initialization complete"
