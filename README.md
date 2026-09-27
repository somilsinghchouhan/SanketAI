# SanketAI
### Digital Investigation & Evidence Intelligence

SanketAI is a digital investigation and evidence intelligence workspace designed to help investigators ingest, normalize, correlate, and inspect heterogeneous digital evidence through a unified interface.

Built as an offline-first forensic workstation, SanketAI processes disparate digital artifacts—such as bank ledgers, UPI transaction dumps, Call Detail Records (CDR), and network session logs—into a structured topological graph, chronological event timeline, and cryptographic chain of custody.

---

## 🔍 Investigation Workflow

```
Digital Evidence Ingestion (CSV / XLSX / XLS / JSON)
        │
        ▼
Data Normalization & Canonicalization (Phone, UPI, MAC, IP, Account)
        │
        ▼
Entity Extraction (Cross-Silo Identity Resolution)
        │
        ▼
Relationship Correlation (Directed Transaction & Communication Links)
        │
        ▼
Rule-Based Risk & Threat Analysis (Mule Velocity, Fan-in Pooling, 3-Hop Chains)
        │
        ▼
Graph Topology & Link Exploration (Interactive ReactFlow Visualization)
        │
        ▼
Chronological Timeline (Unified Multi-Source Timestamped Events)
        │
        ▼
Cryptographic Integrity Verification (SHA-256 Digest Validation)
        │
        ▼
Forensic Dossier Compilation (Court-Ready PDF Generation)
```

---

## ✨ Key Features

- **Multi-Source Evidence Intake**: Upload heterogeneous evidence files (CSV, XLSX, XLS, JSON) with drag-and-drop support, format validation, and automated record parsing.
- **Cryptographic Chain of Custody**: Computes immutable SHA-256 digests at intake; features a dedicated verification center to audit on-disk files against stored checksums for tamper detection.
- **Identity Canonicalization**: Built-in normalization pipelines for phone numbers (stripping country codes/delimiters), UPI handles (case folding), MAC addresses (colon-standardized uppercase), and IPv4 addresses.
- **Automated Entity & Link Extraction**: Extracts bank accounts, phone numbers, UPI identifiers, and IP addresses, constructing directed transaction and communication links with confidence scores.
- **Heuristic Threat & Risk Scoring**: Deterministic, rule-based risk scoring analyzing rapid mule velocity (< 90s forwarding), multi-hop fund routing (3+ hops), and high fan-in pooling bursts.
- **Interactive Graph Canvas**: Node-link topological visualization using ReactFlow with category color indicators, mini-map, pan/zoom controls, and slide-over entity dossiers.
- **Consolidated Event Timeline**: Vertical chronological spine tracking events across disparate sources with currency formatting and provenance references.
- **Court-Ready PDF Dossier**: On-demand judicial forensic report compiled via ReportLab on FastAPI, embedding case telemetry, hash tables, and pattern summaries.
- **Local Officer Authentication**: Secure session management using bcrypt password hashing and JWT access tokens without reliance on external cloud identity providers.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 (Deep Navy & Slate forensic design system)
- **Graph Visualization**: ReactFlow (`@xyflow/react` v12)
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (`backend/sanketai.db`)
- **Authentication**: JWT (`python-jose`) with bcrypt password hashing (`passlib`)
- **Graph Processing**: NetworkX
- **Data Analysis**: Pandas
- **PDF Generation**: ReportLab
- **Testing**: Pytest & HTTPX

---

## 📁 Project Structure

```
SanketAI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI route controllers (auth, cases, evidence, etc.)
│   │   ├── services/        # Business logic (analysis, normalization, report, etc.)
│   │   ├── utils/           # Cryptographic hashing & file helpers
│   │   ├── database.py      # SQLAlchemy engine & session configuration
│   │   ├── models.py        # Relational database schemas
│   │   ├── schemas.py       # Pydantic request/response validation schemas
│   │   └── main.py          # Application entrypoint & CORS middleware
│   ├── storage/             # Local evidence and generated PDF repository (ignored by Git)
│   ├── tests/               # Backend integration test suite
│   ├── init_db.py           # Database table initialization script
│   └── requirements.txt     # Python dependency specifications
├── frontend/
│   ├── public/              # Static assets & SVG emblem
│   ├── src/
│   │   ├── components/      # Common UI, layout, graph nodes, modals, dossiers
│   │   ├── context/         # AuthContext and InvestigationContext state providers
│   │   ├── hooks/           # Asynchronous resource management hooks
│   │   ├── pages/           # Application views (Dashboard, Cases, Graph, Risk, etc.)
│   │   ├── services/        # Frontend API client modules
│   │   ├── utils/           # Data and currency formatters
│   │   ├── App.jsx          # Protected route declarations
│   │   └── main.jsx         # React application root
│   ├── index.html           # Document shell and metadata
│   ├── package.json         # Node.js dependencies and scripts
│   ├── tailwind.config.js   # Forensic color theme configuration
│   └── vite.config.js       # Vite development & build setup
├── .env.example             # Safe template for environment configuration
├── .gitignore               # Comprehensive Git ignore specifications
├── pytest.ini               # Test configuration
└── README.md                # Project documentation
```

---

## ⚙️ Environment Configuration

SanketAI uses an environment file for local runtime settings. Copy the provided `.env.example` template to `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

### Configuration Keys:
```env
# Database Connection (defaults to local SQLite file)
DATABASE_URL=sqlite:///./backend/sanketai.db

# JWT Secret Key for Officer Session Tokens (replace with a secure string)
SECRET_KEY=replace-with-a-secure-secret

# Local Directory for Evidence Uploads and PDF Storage
STORAGE_DIR=./backend/storage

# Frontend API Base URL (used by Vite client)
VITE_API_BASE_URL=http://localhost:8000
```

> **Security Note**: Never commit the `.env` file or SQLite database files to public repositories.

---

## 🚀 Getting Started

### 🔑 Quick Demo / Evaluator Credentials
For testing and hackathon evaluation:
- **Officer ID**: `IND-SKT-9001`
- **Password**: `SanketDemo@2026`
*(The login page also provides a 1-click **Auto-Fill** button)*

---

### 1. Backend Setup

1. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Initialize the SQLite database tables:
   ```bash
   python backend/init_db.py
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The interactive API documentation is accessible at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to access the application.*

---

## 🧪 Testing & Validation

### Backend Test Suite
The backend includes test coverage validating SHA-256 calculation, entity normalization rules, case CRUD, empty state safety, and end-to-end analysis:

```bash
# Run pytest from the repository root
pytest -v
```
*Current status: 7 passed in ~3.3s (100% pass rate).*

### Frontend Production Build
To validate TypeScript/JSX syntax, asset bundling, and compilation:

```bash
cd frontend
npm run build
```
*Current status: Zero build errors; production assets emitted to `frontend/dist/`.*

---

## 🔐 Security & Privacy

- **Zero Cloud Exposure**: SanketAI functions completely offline on the investigator's local workstation. No evidentiary records or hashes are transmitted to external servers.
- **Secret Management**: JWT signing keys and file storage paths remain strictly in local `.env` configuration.
- **Evidence Immutability**: Uploaded evidence files are hashed using SHA-256 upon intake. The files are stored in `backend/storage/uploads/` and excluded from version control via `.gitignore`.
- **Database Safety**: Local SQLite databases (`*.db`, `*.sqlite`) are git-ignored by default to prevent accidental commitment of sensitive case data.

---

## 🔭 Future Improvements

- Support for direct PCAP network packet ingestion and CDR geo-coordinate mapping.
- Integration of optional local LLM adapters (via Ollama / llama.cpp) for natural-language investigative summarization.
- Graph export capabilities to standard forensic formats (e.g., Gephi GEXF, GraphML).
- Role-Based Access Control (RBAC) supporting multi-investigator supervisory audit tiers.

---

## 📄 License & Attribution

No license was added because no licensing decision was provided. All rights reserved by the original project contributors.
