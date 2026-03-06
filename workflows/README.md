# Workflow Exports

## Primary Implementation

The **Python scripts** in `/scripts/` are the primary pipeline implementation. They provide full automation for both Pipeline A (demo → v1) and Pipeline B (onboarding → v2).

### Running the Pipeline

```bash
# Run Pipeline A (demo → v1) for all accounts
python scripts/batch_run.py --pipeline A

# Run Pipeline B (onboarding → v2) for all accounts
python scripts/batch_run.py --pipeline B

# Run both pipelines for all accounts
python scripts/batch_run.py --all

# Force re-processing (overwrite existing outputs)
python scripts/batch_run.py --all --force
```

## n8n Workflow Export

The `n8n_pipeline_export.json` file contains a reference n8n workflow that mirrors the Python pipeline architecture:

1. **Ingest** — Read transcript files from data directory
2. **Extract** — Call LLM to extract Account Memo JSON
3. **Generate** — Create Retell Agent Draft Spec
4. **Store** — Save outputs to Supabase + local JSON
5. **Track** — Update Airtable task tracker

### Importing into n8n

1. Install n8n locally:
   ```bash
   docker run -it --rm -p 5678:5678 n8nio/n8n
   ```
2. Open `http://localhost:5678`
3. Go to **Workflows → Import from File**
4. Select `n8n_pipeline_export.json`
5. Set up credentials (Groq API key, Supabase URL/key, Airtable key)
6. Activate the workflow

> **Note:** The Python scripts are the tested, production-ready implementation. The n8n export serves as a visual reference for the pipeline architecture and can be extended for use in production orchestration environments.
