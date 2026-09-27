"""Database initialization and seeding script for SanketAI.
Creates required forensic schema tables and seeds default evaluator credentials.
"""
import sys
import os

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker
from backend.app.database import engine, Base, DATABASE_URL
from backend.app.models import (
    Officer, Case, Evidence, Entity,
    TransactionRecord, Relationship, RiskScore, Anomaly
)
from backend.app.api.auth import hash_password
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

    # Seed Default Evaluator Officer for Hackathon / Demonstration
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        officer = db.query(Officer).filter(Officer.officer_id == "IND-SKT-9001").first()
        if not officer:
            officer = Officer(
                officer_id="IND-SKT-9001",
                full_name="Inspector Vikrant Rao (Demo Evaluator)",
                email="evaluator@sanketai.internal",
                department="Cyber Forensics & Intelligence Unit",
                password_hash=hash_password("SanketDemo@2026"),
                is_active="ACTIVE"
            )
            db.add(officer)
            db.commit()
            print("Seeded demo evaluator officer: IND-SKT-9001")
        else:
            # Ensure password hash is current
            officer.password_hash = hash_password("SanketDemo@2026")
            officer.is_active = "ACTIVE"
            db.commit()
            print("Refreshed demo evaluator credentials: IND-SKT-9001")

        # Seed Default Case if not present
        case = db.query(Case).filter(Case.case_number == "SKT-2026-084").first()
        if not case:
            case = Case(
                case_number="SKT-2026-084",
                title="Operation Falcon: Mule Conduit Egress",
                description="Forensic tracking of multi-hop UPI fraud conduits and suspicious crypto cashouts.",
                status="ACTIVE"
            )
            db.add(case)
            db.commit()
            print("Seeded demo case: SKT-2026-084")
    except Exception as e:
        print(f"Warning during seed: {e}")
        db.rollback()
    finally:
        db.close()

    print("\nSanketAI database initialization and seeding completed successfully.")


if __name__ == "__main__":
    initialize_database()
