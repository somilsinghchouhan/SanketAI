"""Realistic Forensics Intelligence Seeding Script for SanketAI.
Populates realistic cyber-investigation cases, multi-source evidence files,
extracted entities, topological link graphs, behavioral anomalies, and risk scores.
"""
import os
import sys
import json
import hashlib
import datetime

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import sessionmaker
from backend.app.database import engine, Base
from backend.app.models import (
    Officer, Case, Evidence, Entity,
    TransactionRecord, Relationship, RiskScore, Anomaly
)
from backend.app.api.auth import hash_password
from backend.app.utils.file_utils import ensure_directories, STORAGE_DIR


def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def seed_cases_and_evidence():
    print("=== Seeding Realistic Forensic Intelligence Data for SanketAI ===")
    ensure_directories()
    Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)
    db = Session()

    uploads_dir = os.path.join(STORAGE_DIR, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    # 1. Ensure Evaluator Officer exists
    officer = db.query(Officer).filter(Officer.officer_id == "IND-SKT-9001").first()
    if not officer:
        officer = Officer(
            officer_id="IND-SKT-9001",
            full_name="Inspector Vikrant Rao (Demo Evaluator)",
            email="evaluator@sanketai.internal",
            department="Cyber Forensics & Financial Intelligence Unit",
            password_hash=hash_password("SanketDemo@2026"),
            is_active="ACTIVE"
        )
        db.add(officer)
        db.commit()
        print("[+] Created Demo Evaluator Officer: IND-SKT-9001")
    else:
        officer.password_hash = hash_password("SanketDemo@2026")
        officer.is_active = "ACTIVE"
        db.commit()
        print("[*] Verified Demo Evaluator Officer: IND-SKT-9001")

    # =========================================================================
    # CASE 1: Operation Falcon - UPI Mule Conduit & Crypto Cashout Ring
    # =========================================================================
    c1 = db.query(Case).filter(Case.case_number == "SKT-2026-084").first()
    if not c1:
        c1 = Case(
            case_number="SKT-2026-084",
            title="Operation Falcon: Multi-Hop UPI Mule Network",
            description="Forensic investigation into an automated laundering ring routing fraudulent cyber-extortion funds across high-velocity mule accounts into crypto OTC escrows.",
            status="ANALYZED"
        )
        db.add(c1)
        db.commit()
        db.refresh(c1)
        print("[+] Seeded Case: SKT-2026-084")
    else:
        c1.title = "Operation Falcon: Multi-Hop UPI Mule Network"
        c1.status = "ANALYZED"
        db.commit()

    # Create Evidence File 1 for Case 1
    csv1_content = (
        "transaction_id,source_account,target_account,amount,timestamp,channel\n"
        "TX-FAL-101,Victim-HDFC-9012,MuleHub-ICICI-4410,125000.0,2026-03-01 09:12:00,UPI\n"
        "TX-FAL-102,Victim-SBI-8821,MuleHub-ICICI-4410,85000.0,2026-03-01 09:14:30,UPI\n"
        "TX-FAL-103,MuleHub-ICICI-4410,Transit-Axis-8819,200000.0,2026-03-01 09:16:15,IMPS\n"
        "TX-FAL-104,Transit-Axis-8819,Cashout-KOTAK-3102,195000.0,2026-03-01 09:18:00,RTGS\n"
        "TX-FAL-105,Cashout-KOTAK-3102,CryptoEscrow-P2P-X9,190000.0,2026-03-01 09:22:45,IMPS\n"
    ).encode("utf-8")
    
    hash1 = compute_sha256(csv1_content)
    path1 = os.path.join(uploads_dir, f"evidence_c1_falcon_ledger.csv")
    with open(path1, "wb") as f:
        f.write(csv1_content)

    ev1 = db.query(Evidence).filter(Evidence.case_id == c1.id, Evidence.original_filename == "falcon_banking_ledger.csv").first()
    if not ev1:
        ev1 = Evidence(
            case_id=c1.id,
            filename=f"evidence_c1_falcon_ledger.csv",
            original_filename="falcon_banking_ledger.csv",
            file_type="CSV",
            file_size=len(csv1_content),
            stored_path=path1,
            sha256_hash=hash1,
            processing_status="PROCESSED",
            record_count=5
        )
        db.add(ev1)
        db.commit()
        db.refresh(ev1)

    # Entities for Case 1
    entities_c1_data = [
        ("ACCOUNT", "MuleHub-ICICI-4410", "mulehub-icici-4410", "ICICI Bank - Cyberabad", "ACC-4410", 88, "CRITICAL",
         ["Rapid Forwarding (<90s)", "Fan-in Pooling Burst", "High Value Ingress"], 4),
        ("ACCOUNT", "Transit-Axis-8819", "transit-axis-8819", "Axis Bank - BKC Branch", "ACC-8819", 76, "HIGH",
         ["Layering Conduit", "Pass-through Velocity"], 3),
        ("ACCOUNT", "Cashout-KOTAK-3102", "cashout-kotak-3102", "Kotak Mahindra Bank", "ACC-3102", 72, "HIGH",
         ["Rapid Egress Node", "Escrow Transfer Target"], 2),
        ("UPI", "mulehub.transit@icici", "mulehub.transit@icici", "NPCI / ICICI UPI", "UPI-MULE", 85, "CRITICAL",
         ["Connected to MuleHub Account", "Offshore IP Access"], 3),
        ("ACCOUNT", "CryptoEscrow-P2P-X9", "cryptoescrow-p2p-x9", "P2P Crypto Exchange Escrow", "ESCROW-X9", 65, "MEDIUM",
         ["Offshore Crypto Conversion Point"], 1),
        ("IP", "185.220.101.5", "185.220.101.5", "Tor Exit Node / Bulletproof VPS", "IP-TOR", 90, "CRITICAL",
         ["Anonymized Command Gateway", "Foreign Geolocation"], 2),
        ("PHONE", "+91-98440-12901", "9844012901", "Airtel Telecom - Delhi Circle", "SIM-12901", 68, "HIGH",
         ["Linked to ICICI Mule Account", "Burner SIM Telemetry"], 2),
        ("ACCOUNT", "Victim-HDFC-9012", "victim-hdfc-9012", "HDFC Bank - Fort Mumbai", "ACC-9012", 15, "LOW",
         ["Complainant Account"], 1),
        ("ACCOUNT", "Victim-SBI-8821", "victim-sbi-8821", "State Bank of India", "ACC-8821", 12, "LOW",
         ["Complainant Account"], 1),
    ]

    ent_map_c1 = {}
    for etype, evalue, enorm, inst, ident, score, sev, reasons, nodes in entities_c1_data:
        ent = db.query(Entity).filter(Entity.case_id == c1.id, Entity.entity_value == evalue).first()
        if not ent:
            ent = Entity(
                case_id=c1.id,
                entity_type=etype,
                entity_value=evalue,
                normalized_value=enorm,
                institution=inst,
                identifier=ident,
                first_seen="2026-03-01 09:12:00",
                last_seen="2026-03-01 09:22:45",
                evidence_refs_json=json.dumps([{"file": "falcon_banking_ledger.csv", "hash": hash1[:16], "match": "DIRECT_MATCH"}])
            )
            db.add(ent)
            db.commit()
            db.refresh(ent)

        ent_map_c1[evalue] = ent

        # Risk score for entity
        rs = db.query(RiskScore).filter(RiskScore.case_id == c1.id, RiskScore.entity_id == ent.id).first()
        if not rs:
            rs = RiskScore(
                case_id=c1.id,
                entity_id=ent.id,
                score=score,
                severity=sev,
                reasons_json=json.dumps(reasons),
                weights_json=json.dumps([{"label": r, "pts": 25, "color": "red" if sev in ("CRITICAL", "HIGH") else "amber"} for r in reasons])
            )
            db.add(rs)
            db.commit()

    # Relationships for Case 1
    rel_c1_data = [
        ("Victim-HDFC-9012", "MuleHub-ICICI-4410", "TRANSACTION", 1.0, "₹1,25,000 via UPI (Fraudulent Debit)"),
        ("Victim-SBI-8821", "MuleHub-ICICI-4410", "TRANSACTION", 1.0, "₹85,000 via UPI (Fraudulent Debit)"),
        ("MuleHub-ICICI-4410", "Transit-Axis-8819", "TRANSFER", 1.0, "₹2,00,000 Rapid Sweep in 105s"),
        ("Transit-Axis-8819", "Cashout-KOTAK-3102", "TRANSFER", 1.0, "₹1,95,000 RTGS Layering"),
        ("Cashout-KOTAK-3102", "CryptoEscrow-P2P-X9", "TRANSACTION", 1.0, "₹1,90,000 Final Crypto OTC Purchase"),
        ("MuleHub-ICICI-4410", "+91-98440-12901", "CONNECTED_TO", 0.95, "Registered Mobile Number for OTP"),
        ("MuleHub-ICICI-4410", "185.220.101.5", "SHARED_IP", 0.9, "Netbanking Session IP"),
        ("mulehub.transit@icici", "MuleHub-ICICI-4410", "CONNECTED_TO", 1.0, "Primary VPA linked to account"),
    ]

    for src_val, tgt_val, rtype, conf, reason in rel_c1_data:
        src = ent_map_c1.get(src_val)
        tgt = ent_map_c1.get(tgt_val)
        if src and tgt:
            rel = db.query(Relationship).filter(
                Relationship.case_id == c1.id,
                Relationship.source_entity_id == src.id,
                Relationship.target_entity_id == tgt.id,
                Relationship.relationship_type == rtype
            ).first()
            if not rel:
                rel = Relationship(
                    case_id=c1.id,
                    source_entity_id=src.id,
                    target_entity_id=tgt.id,
                    relationship_type=rtype,
                    confidence=conf,
                    evidence_id=ev1.id,
                    timestamp="2026-03-01 09:16:00",
                    reason=reason,
                    metadata_json=json.dumps({"source": src_val, "target": tgt_val, "source_type": src.entity_type, "target_type": tgt.entity_type})
                )
                db.add(rel)
                db.commit()

    # Anomalies for Case 1
    anomalies_c1 = [
        ("RAPID_FORWARDING", "CRITICAL", "Rapid Fund Forwarding (< 105 seconds)",
         "MuleHub-ICICI-4410 ➔ Transit-Axis-8819 ➔ Cashout-KOTAK-3102",
         "105 seconds latency between ingress and layering sweep",
         "falcon_banking_ledger.csv:L3",
         "High velocity automated mule transit detected. Ingress funds pooled from multiple victims were forwarded into an intermediary conduit within 105 seconds to evade freeze notices."),
        ("3_HOP_CHAIN", "HIGH", "3-Hop Layering to Crypto OTC Escrow",
         "Victims ➔ MuleHub-ICICI-4410 ➔ Transit-Axis-8819 ➔ CryptoEscrow-P2P-X9",
         "3 Hops across 4 financial institutions",
         "falcon_banking_ledger.csv:L1-L5",
         "Multi-tier transactional conduit designed to break the judicial audit trail before converting fiat into untraceable crypto tokens."),
        ("FAN_IN_BURST", "HIGH", "High Fan-in Pooling Burst",
         "Victim-HDFC-9012 + Victim-SBI-8821 ➔ MuleHub-ICICI-4410",
         "2 simultaneous victim deposits within 150 seconds",
         "falcon_banking_ledger.csv:L1-L2",
         "Concentration point pattern. Simultaneous credits from distinct victim accounts into a central consolidation hub.")
    ]

    for ptype, sev, title, flow, latency, sref, exp in anomalies_c1:
        anom = db.query(Anomaly).filter(Anomaly.case_id == c1.id, Anomaly.title == title).first()
        if not anom:
            anom = Anomaly(
                case_id=c1.id,
                pattern_type=ptype,
                severity=sev,
                title=title,
                flow_summary=flow,
                latency_info=latency,
                source_ref=sref,
                explanation=exp
            )
            db.add(anom)
            db.commit()

    # Timeline Transactions for Case 1
    tx_data_c1 = [
        ("Victim-HDFC-9012", "MuleHub-ICICI-4410", 125000.0, "2026-03-01 09:12:00", "UPI-1092841029", "UPI"),
        ("Victim-SBI-8821", "MuleHub-ICICI-4410", 85000.0, "2026-03-01 09:14:30", "UPI-1092841098", "UPI"),
        ("MuleHub-ICICI-4410", "Transit-Axis-8819", 200000.0, "2026-03-01 09:16:15", "IMPS-4910248102", "IMPS"),
        ("Transit-Axis-8819", "Cashout-KOTAK-3102", 195000.0, "2026-03-01 09:18:00", "RTGS-991204812", "RTGS"),
        ("Cashout-KOTAK-3102", "CryptoEscrow-P2P-X9", 190000.0, "2026-03-01 09:22:45", "IMPS-8849102481", "IMPS"),
    ]
    for sval, tval, amt, ts, ref, chan in tx_data_c1:
        tx = db.query(TransactionRecord).filter(TransactionRecord.case_id == c1.id, TransactionRecord.transaction_reference == ref).first()
        if not tx:
            tx = TransactionRecord(
                case_id=c1.id,
                evidence_id=ev1.id,
                source_value=sval,
                target_value=tval,
                amount=amt,
                timestamp=ts,
                transaction_reference=ref,
                channel=chan
            )
            db.add(tx)
            db.commit()

    # =========================================================================
    # CASE 2: Operation GhostSIM - SIM Swap & Corporate Wire Fraud
    # =========================================================================
    c2 = db.query(Case).filter(Case.case_number == "SKT-2026-112").first()
    if not c2:
        c2 = Case(
            case_number="SKT-2026-112",
            title="Operation GhostSIM: Targeted SIM Swap & Wire Fraud",
            description="Forensic investigation into corporate treasury compromise executed via fraudulent SIM replacement and shared rogue mobile IMEI devices.",
            status="ANALYZED"
        )
        db.add(c2)
        db.commit()
        db.refresh(c2)
        print("[+] Seeded Case: SKT-2026-112")

    csv2_content = (
        "transaction_id,source_account,target_account,amount,timestamp,channel\n"
        "TX-SIM-01,CorpTreasury-CITI-100,OffshoreConduit-DBS-88,4500000.0,2026-02-24 14:10:00,WIRE\n"
        "TX-SIM-02,OffshoreConduit-DBS-88,MuleNest-HSBC-33,2200000.0,2026-02-24 14:18:30,WIRE\n"
        "TX-SIM-03,OffshoreConduit-DBS-88,MuleNest-SCB-44,2150000.0,2026-02-24 14:21:00,WIRE\n"
    ).encode("utf-8")
    hash2 = compute_sha256(csv2_content)
    path2 = os.path.join(uploads_dir, f"evidence_c2_ghostsim_wire.csv")
    with open(path2, "wb") as f:
        f.write(csv2_content)

    ev2 = db.query(Evidence).filter(Evidence.case_id == c2.id, Evidence.original_filename == "ghostsim_wire_transfers.csv").first()
    if not ev2:
        ev2 = Evidence(
            case_id=c2.id,
            filename=f"evidence_c2_ghostsim_wire.csv",
            original_filename="ghostsim_wire_transfers.csv",
            file_type="CSV",
            file_size=len(csv2_content),
            stored_path=path2,
            sha256_hash=hash2,
            processing_status="PROCESSED",
            record_count=3
        )
        db.add(ev2)
        db.commit()
        db.refresh(ev2)

    entities_c2_data = [
        ("ACCOUNT", "OffshoreConduit-DBS-88", "offshoreconduit-dbs-88", "DBS Bank Singapore", "ACC-DBS88", 92, "CRITICAL",
         ["International Wire Laundering", "Rapid Splitting Conduit"], 3),
        ("ACCOUNT", "MuleNest-HSBC-33", "mulenest-hsbc-33", "HSBC Commercial", "ACC-HSBC33", 82, "HIGH",
         ["High-Balance Extraction Node"], 2),
        ("ACCOUNT", "MuleNest-SCB-44", "mulenest-scb-44", "Standard Chartered Bank", "ACC-SCB44", 80, "HIGH",
         ["High-Balance Extraction Node"], 2),
        ("PHONE", "+91-99220-44199", "9922044199", "Vi Telecom - Mumbai Circle", "SIM-SWAP-VICTIM", 85, "CRITICAL",
         ["Subject to Unauthorized SIM Swap 18 min prior to wire"], 2),
        ("IMEI", "356938035643809", "356938035643809", "OnePlus 11 (Hardware Hash)", "IMEI-ROGUE", 89, "CRITICAL",
         ["Shared Rogue Device used across 3 fraudulent SIMs"], 3),
        ("IP", "103.251.167.42", "103.251.167.42", "Commercial Proxy / VPN Gateway", "IP-PROXY", 75, "HIGH",
         ["Initiator of Unauthorized Corporate Session"], 2),
        ("ACCOUNT", "CorpTreasury-CITI-100", "corptreasury-citi-100", "Citibank India Treasury", "CORP-CITI", 10, "LOW",
         ["Compromised Corporate Entity"], 1),
    ]

    ent_map_c2 = {}
    for etype, evalue, enorm, inst, ident, score, sev, reasons, nodes in entities_c2_data:
        ent = db.query(Entity).filter(Entity.case_id == c2.id, Entity.entity_value == evalue).first()
        if not ent:
            ent = Entity(
                case_id=c2.id,
                entity_type=etype,
                entity_value=evalue,
                normalized_value=enorm,
                institution=inst,
                identifier=ident,
                first_seen="2026-02-24 13:52:00",
                last_seen="2026-02-24 14:21:00",
                evidence_refs_json=json.dumps([{"file": "ghostsim_wire_transfers.csv", "hash": hash2[:16], "match": "DIRECT_MATCH"}])
            )
            db.add(ent)
            db.commit()
            db.refresh(ent)
        ent_map_c2[evalue] = ent

        rs = db.query(RiskScore).filter(RiskScore.case_id == c2.id, RiskScore.entity_id == ent.id).first()
        if not rs:
            rs = RiskScore(
                case_id=c2.id,
                entity_id=ent.id,
                score=score,
                severity=sev,
                reasons_json=json.dumps(reasons),
                weights_json=json.dumps([{"label": r, "pts": 30, "color": "red"} for r in reasons])
            )
            db.add(rs)
            db.commit()

    rel_c2_data = [
        ("CorpTreasury-CITI-100", "OffshoreConduit-DBS-88", "TRANSFER", 1.0, "₹45,00,000 Fraudulent Corporate Wire"),
        ("OffshoreConduit-DBS-88", "MuleNest-HSBC-33", "TRANSFER", 1.0, "₹22,00,000 Egress Splitting"),
        ("OffshoreConduit-DBS-88", "MuleNest-SCB-44", "TRANSFER", 1.0, "₹21,50,000 Egress Splitting"),
        ("+91-99220-44199", "356938035643809", "SHARED_IMEI", 0.98, "SIM active on rogue handset at 14:02"),
        ("356938035643809", "103.251.167.42", "SHARED_IP", 0.95, "Device network session"),
    ]

    for src_val, tgt_val, rtype, conf, reason in rel_c2_data:
        src = ent_map_c2.get(src_val)
        tgt = ent_map_c2.get(tgt_val)
        if src and tgt:
            rel = db.query(Relationship).filter(
                Relationship.case_id == c2.id,
                Relationship.source_entity_id == src.id,
                Relationship.target_entity_id == tgt.id
            ).first()
            if not rel:
                rel = Relationship(
                    case_id=c2.id,
                    source_entity_id=src.id,
                    target_entity_id=tgt.id,
                    relationship_type=rtype,
                    confidence=conf,
                    evidence_id=ev2.id,
                    timestamp="2026-02-24 14:10:00",
                    reason=reason,
                    metadata_json=json.dumps({"source": src_val, "target": tgt_val, "source_type": src.entity_type, "target_type": tgt.entity_type})
                )
                db.add(rel)
                db.commit()

    anomalies_c2 = [
        ("RAPID_FORWARDING", "CRITICAL", "High-Value Offshore Wire Egress",
         "CorpTreasury-CITI-100 ➔ OffshoreConduit-DBS-88 ➔ (MuleNest-HSBC + SCB)",
         "₹45,00,000 split within 11 minutes of SIM swap",
         "ghostsim_wire_transfers.csv:L1-L3",
         "SIM swap preceded treasury wire transfer. Funds immediately fragmented across two international clearing conduits."),
        ("SHARED_IMEI", "CRITICAL", "Shared Burner Handset Hardware Correlated",
         "+91-99220-44199 ➔ IMEI-356938035643809",
         "Hardware IMEI matched across 3 fraudulent SIM swaps",
         "telecom_cdr_dump.csv",
         "Carrier telemetry confirms victim MSISDN was re-provisioned into an IMEI previously flagged in prior FIR complaints.")
    ]
    for ptype, sev, title, flow, latency, sref, exp in anomalies_c2:
        anom = db.query(Anomaly).filter(Anomaly.case_id == c2.id, Anomaly.title == title).first()
        if not anom:
            anom = Anomaly(
                case_id=c2.id,
                pattern_type=ptype,
                severity=sev,
                title=title,
                flow_summary=flow,
                latency_info=latency,
                source_ref=sref,
                explanation=exp
            )
            db.add(anom)
            db.commit()

    for sval, tval, amt, ts, ref, chan in [
        ("CorpTreasury-CITI-100", "OffshoreConduit-DBS-88", 4500000.0, "2026-02-24 14:10:00", "WIRE-CITI-001", "WIRE"),
        ("OffshoreConduit-DBS-88", "MuleNest-HSBC-33", 2200000.0, "2026-02-24 14:18:30", "WIRE-DBS-002", "WIRE"),
        ("OffshoreConduit-DBS-88", "MuleNest-SCB-44", 2150000.0, "2026-02-24 14:21:00", "WIRE-DBS-003", "WIRE"),
    ]:
        tx = db.query(TransactionRecord).filter(TransactionRecord.case_id == c2.id, TransactionRecord.transaction_reference == ref).first()
        if not tx:
            tx = TransactionRecord(
                case_id=c2.id,
                evidence_id=ev2.id,
                source_value=sval,
                target_value=tval,
                amount=amt,
                timestamp=ts,
                transaction_reference=ref,
                channel=chan
            )
            db.add(tx)
            db.commit()

    # =========================================================================
    # CASE 3: Operation Predator - Predatory Loan App & Instant Mule Extortion
    # =========================================================================
    c3 = db.query(Case).filter(Case.case_number == "SKT-2026-205").first()
    if not c3:
        c3 = Case(
            case_number="SKT-2026-205",
            title="Operation Predator: Loan App Extortion & Micro-Deposits",
            description="Intelligence dossier analyzing 42 victim micropayments extorted via unauthorized mobile contacts access and routed through digital UPI VPAs.",
            status="ANALYZED"
        )
        db.add(c3)
        db.commit()
        db.refresh(c3)
        print("[+] Seeded Case: SKT-2026-205")

    # =========================================================================
    # CASE 4: Operation DarkMesh - Phishing Infrastructure & Account Takeover
    # =========================================================================
    c4 = db.query(Case).filter(Case.case_number == "SKT-2026-319").first()
    if not c4:
        c4 = Case(
            case_number="SKT-2026-319",
            title="Operation DarkMesh: Banking Phishing & Credential Harvester",
            description="Cross-jurisdictional cyber incident tracking adversary reverse-proxy infrastructure deploying Adversary-in-the-Middle (AiTM) phishing kits.",
            status="ACTIVE"
        )
        db.add(c4)
        db.commit()
        db.refresh(c4)
        print("[+] Seeded Case: SKT-2026-319")

    db.close()
    print("[OK] All 4 realistic forensic investigation cases successfully seeded!")


if __name__ == "__main__":
    seed_cases_and_evidence()
