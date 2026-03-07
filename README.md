# Clara AI Pipeline

## 1. Project Overview

Clara AI Pipeline is a complete full-stack platform featuring a beautifully designed **React Single Page Application (SPA)** for managing AI Voice Agents, alongside a fully automated backend system that converts raw sales demo and onboarding call transcripts into production-ready configurations. It uses a multi-provider LLM strategy (Mistral → Gemini → Groq) to extract business rules, generate voice agent prompts, and track version changes — all at zero cost.

The pipeline processes transcripts in two stages: **Pipeline A** extracts initial business data from demo calls to create v1 configurations, and **Pipeline B** refines these with onboarding call data to produce v2 configurations with a detailed changelog of what changed and why.

---

## 2. Frontend Interface

The newly integrated Frontend is a highly responsive, cinematic React interface utilizing deep-navy visuals and glassmorphism UI patterns.

*   **Public Portal**: Immersive Landing Page, dynamic Pricing toggles, Markdown-ready Docs & Blog areas.
*   **Authentication**: Built-in flow integrated precisely with Supabase Google OAuth (`/login`, Protected Routes).
*   **Dashboard**: Secure user portal (`/dashboard`) managing account statistics, pipeline quick runs, and recent activity metrics.

---

## 3. Architecture

```
Demo Transcript (.txt)
        ↓
[Pipeline A — scripts/batch_run.py]
        ↓
LLM Extraction (Mistral/Gemini/Groq)
        ↓
Account Memo JSON v1
        ↓
Agent Spec JSON v1
        ↓
Saved to Supabase + Local files
        ↓
Airtable task record created
        ↓ 
Onboarding Transcript (.txt)
        ↓
[Pipeline B — scripts/batch_run.py]
        ↓
LLM Patch Extraction
        ↓
Merge v1 + Delta = v2 Memo
        ↓
Agent Spec JSON v2
        ↓
Changelog (changes.json + changes.md)
        ↓
Saved to Supabase + Local files
        ↓
Airtable record updated
```

---

## 4. Tech Stack

| Component | Tool | Purpose | Cost |
|---|---|---|---|
| Orchestration | n8n (Docker) | Workflow automation | Free |
| Frontend | React + Vite + Tailwind | User Interface | Free |
| Animations | Framer Motion | UI Transitions | Free |
| State/Routing | React Router DOM | SPA Navigation | Free |
| Primary LLM | Mistral medium-2505 | Extraction + generation | Free |
| Fallback LLM 1 | Mistral small-2506 | Backup primary | Free |
| Fallback LLM 2 | Gemini 2.5 Flash-Lite | Alt provider | Free |
| Fallback LLM 3 | Gemini 2.5 Flash | Alt provider | Free |
| Fallback LLM 4 | Groq llama-3.3-70b | Last resort (chunked) | Free |
| Fallback LLM 5 | Groq llama-3.1-8b | Last resort (chunked) | Free |
| Database | Supabase (free tier) | All data storage + Auth | Free |
| Local storage | JSON files | Supabase fallback | Free |
| Task tracker | Airtable (free tier) | Status tracking | Free |
| Voice platform | Retell AI | Agent deployment | Free |
| Version control | GitHub | Code + outputs | Free |
| Runtime | Python 3.10+ & Node.js 18+ | Scripts & Frontend | Free |
| **Total cost** | | | **$0.00** |

---

## 5. LLM Zero-Cost Strategy

The pipeline uses a 6-position fallback chain to guarantee zero-cost operation:

| Position | Provider | Model | Context | Strategy |
|---|---|---|---|---|
| 1 | Mistral | mistral-medium-2505 | 200K | Full transcript, no chunking |
| 2 | Mistral | mistral-small-2506 | 150K | Full transcript, no chunking |
| 3 | Gemini | gemini-2.5-flash-lite | 150K | Full transcript, no chunking |
| 4 | Gemini | gemini-2.5-flash | 150K | Full transcript, no chunking |
| 5 | Groq | llama-3.3-70b-versatile | 20K | Smart chunking + merge |
| 6 | Groq | llama-3.1-8b-instant | 14K | Smart chunking + merge |

**Rate limit handling:**
- **401 (auth):** Disable provider for entire session (key won't fix itself)
- **429 per-minute:** Wait 60s, retry once
- **429 per-day:** Skip immediately to next position
- **500/503:** Exponential backoff (max 3 retries)

**Test run results (10 accounts, 10 pipeline runs):**
All accounts processed via Gemini 2.5-flash-lite (Position 3). When flash-lite hit rate limits, Gemini 2.5-flash (Position 4) handled the remainder. Total: ~200K tokens, $0.00.

---

## 6. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Python 3.10+
- Git
- [Mistral AI account](https://console.mistral.ai) — free API key
- [Groq account](https://console.groq.com) — free API key
- [Gemini account](https://aistudio.google.com) — free API key
- [Supabase account](https://supabase.com) — free project
- [Airtable account](https://airtable.com) — free base
- [Retell AI account](https://retell.ai) — for agent deployment
- [GitHub account](https://github.com) — for version control

---

## 7. Setup Guide

### Step 1: Clone the repo
```bash
git clone <repo-url>
cd clara-ai-pipeline
```

### Step 2: DNS setup (India / ISP blocking)
Change DNS to `1.1.1.1` and `1.0.0.1` to prevent Supabase ISP blocking.

### Step 3: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create Supabase tables
1. Go to Supabase → SQL Editor
2. Paste and run contents of `schema.sql`
3. Verify 5 tables created: `accounts`, `account_memos`, `agent_specs`, `changelogs`, `pipeline_runs`

### Step 5: Configure environment
```bash
cp .env.example .env
```
Fill in all API keys (see `.env.example` for detailed instructions).

### Step 6: Start n8n via Docker
```bash
docker-compose up -d
```
Access at `http://localhost:5678` — Login: `admin` / `claraadmin`

### Step 7: Import n8n workflow
Import `workflows/n8n_pipeline_export.json` into n8n.

### Step 8: Start Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Access the web UI at `http://localhost:5173`. Make sure you have added your Supabase credentials to `frontend/.env`.

---

## 8. Running the Pipeline

### Add transcripts
```
data/demo/{account_id}_demo.txt
data/onboarding/{account_id}_onboarding.txt
```

### Run Pipeline A (demo calls → v1)
```bash
python -m scripts.batch_run --pipeline A
```

### Run Pipeline B (onboarding calls → v2)
```bash
python -m scripts.batch_run --pipeline B
```

### Run everything
```bash
python -m scripts.batch_run --all
```

### Single account
```bash
python -m scripts.batch_run --pipeline A --account benselectric
```

### Force re-run (overwrite existing)
```bash
python -m scripts.batch_run --pipeline A --force
```

---

## 9. Output Structure

```
outputs/accounts/{account_id}/
├── v1/
│   ├── account_memo.json      # Business rules from demo call
│   └── agent_spec.json        # Retell agent config v1
└── v2/
    ├── account_memo.json      # Updated rules from onboarding
    ├── agent_spec.json        # Updated agent config v2
    ├── changes.json           # Machine-readable diff (field, type, old, new, reason)
    └── changes.md             # Human-readable changelog
```

**account_memo.json** — Extracted business rules: company info, services, hours, emergency routing, call handling rules, integration constraints.

**agent_spec.json** — Retell-ready config: system prompt with greeting/business hours/after hours/emergency flows, call transfer protocol, fallback protocol, placeholders list.

**changes.json** — Structured diff with `updated`, `added`, and `resolved` change types.

**changes.md** — Markdown changelog with before/after tables, new fields list, resolved unknowns.

---

## 10. Retell Manual Import

1. Open [retell.ai](https://retell.ai) dashboard
2. Go to **Agents → Create New Agent**
3. Open `agent_spec.json` for the account
4. Copy `system_prompt` and paste into agent behavior window
5. Replace all `[ALL_CAPS]` placeholders with actual values
6. Configure transfer settings from `call_transfer_protocol`
7. Configure fallback from `fallback_protocol`
8. Click **Deploy**

---

## 11. Supabase Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `accounts` | One row per business account | account_id, company_name, status |
| `account_memos` | Business rules (v1 + v2) | account_id, version, memo (JSONB) |
| `agent_specs` | Agent configurations (v1 + v2) | account_id, version, spec (JSONB) |
| `changelogs` | v1→v2 change tracking | account_id, changes_json, summary |
| `pipeline_runs` | Execution audit trail | account_id, pipeline, status, duration |

---

## 12. Known Limitations

1. **Mistral API key** — Must be valid for Position 1-2 to work; otherwise falls back to Gemini
2. **Gemini rate limits** — Daily RPD limits can be hit during heavy testing (auto-fallback handles this)
3. **Groq context limits** — Small TPM requires smart chunking for transcripts >14K chars
4. **Supabase free tier** — Limited to 2 projects and 500MB storage
5. **Hallucination detection** — Basic substring matching; no semantic verification
6. **Retell API** — Programmatic agent creation requires paid tier; manual import needed on free tier

---

## 13. Future Improvements

With production access, the pipeline would benefit from:

1. **Mistral or OpenAI as guaranteed primary** — Paid tier for consistent availability
2. **Direct Retell API integration** — Programmatic agent creation and updates
3. **Webhook triggers** — Replace file watching with real-time event processing
4. **Web dashboard** — Pipeline monitoring and status visualization
5. **Automated diff viewer** — Side-by-side v1/v2 comparison UI
6. **Production Postgres** — Managed database with automated backups
7. **Automated testing suite** — CI/CD pipeline with regression tests
