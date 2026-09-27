"""Database initialization and seeding script for SanketAI.
Creates required forensic schema tables and seeds realistic cases and evaluator credentials.
"""
import sys
import os

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect
from backend.app.database import engine, Base, DATABASE_URL
from backend.app.utils.file_utils import ensure_directories, STORAGE_DIR
from backend.scripts.seed_realistic_demo import seed_cases_and_evidence


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

    # Seed realistic forensic cases, evidence, entities, graph, anomalies, and officer credentials
    try:
        seed_cases_and_evidence()
    except Exception as e:
        print(f"Seeding notice: {e}")

    print("\nSanketAI database initialization and seeding completed successfully.")


if __name__ == "__main__":
    initialize_database()
