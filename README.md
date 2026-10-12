# CreoVate AI — Prismatch Creator Marketplace

**CreoVate AI (Prismatch)** is an AI-Native Creator Marketplace connecting brands with hyper-specialized generative AI creators, prompt engineers, and visual directors.

Powered by **Python**, **Pandas**, and **FastAPI**, featuring an interactive **Streamlit** dashboard and a responsive 4-screen web application.

---

## 🚀 Features

- **Pandas Data Engine (`backend/engine.py`)**: Multi-attribute filtering, boolean masks, creator ranking, and statistics.
- **AI Brief Deconstruction**: Parses raw creative briefs to automatically detect style, aspect ratio (9:16 vs 16:9), audio specs, and model pipelines.
- **CreativeTwin™ Matching**: Vectorized scoring algorithm ranking creators based on campaign requirements.
- **ProcessProof™ Escrow Ledger**: Milestone escrow logging persisted directly to `bookings.csv`.
- **Streamlit Data Workspace (`streamlit_app.py`)**: 5 interactive tabs with live Pandas charts, filters, and raw data explorer.
- **Interactive 4-Screen Web App (`server.py`)**:
  - `Home`: KPI metrics, hero search, platform stats.
  - `Find Creators`: Multi-facet sidebar filters (category, platform, budget, delivery, AI models).
  - `Creator Profile`: Prompt recipe inspector, hardware specifications, and package tiers.
  - `Brief Builder`: Step-by-step campaign builder with escrow checkout.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, Pandas, FastAPI, Uvicorn, Pydantic
- **Data Workspace**: Streamlit
- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS
- **Data Storage**: JSON & CSV (`creators.json`, `creators.csv`, `bookings.csv`)

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/bharshith6232/CreoVate_Ai.git
cd CreoVate_Ai
```

### 2. Set up Python virtual environment
```bash
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

---

## 🏃 Running the Application

### Option A: Web Marketplace & REST API (Port 8000)
```bash
python server.py
```
Open **`http://localhost:8000`** in your browser.

### Option B: Streamlit Data Workspace (Port 8501)
```bash
streamlit run streamlit_app.py
```
Open **`http://localhost:8501`** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Engine health check & indexed creator count |
| `GET` | `/api/stats` | Aggregated marketplace metrics |
| `GET` | `/api/creators` | Multi-criteria creator search & filter |
| `GET` | `/api/creators/{id}` | Detailed creator profile & prompt recipes |
| `POST` | `/api/brief/refine-ai` | AI brief signal deconstruction |
| `POST` | `/api/campaigns/match` | CreativeTwin™ creator matching |
| `POST` | `/api/bookings` | Milestone escrow transaction creation |

---

## 📄 License
MIT License. Created for CreoVate AI.
