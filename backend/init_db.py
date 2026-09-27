"""Database initialization script for SanketAI.
Creates a fresh SQLite database with all required forensic schema tables.
"""
import sys
import os

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect
from backend.app.database import engine, Base, DATABASE_URL
# Import all models to register with Base metadata
from backend.app.models import (
    Officer, Case, Evidence, Entity,
    TransactionRecord, Relationship, RiskScore, Anomaly
)
from backend.app.utils.file_utils import ensure_directories, STORAGE_DIR


def initialize_database():
    print(f"Initializing SanketAI Database...")
    print(f"Database URL: {DATABASE_URL}")
    print(f"Storage Directory: {STORAGE_DIR}")

    # Ensure storage paths exist
    ensure_directories()

    # Create all tables defined in models
    Base.metadata.create_all(bind=engine)

    # Verify created tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables created successfully:")
    for table in sorted(tables):
        print(f"  - {table}")

    print("\nSanketAI database initialization completed successfully.")


if __name__ == "__main__":
    initialize_database()
