"""
storage.py — Handles all data persistence for Clara AI Pipeline
Primary: Supabase REST API
Fallback: Local JSON files (auto-triggered if Supabase unreachable)
Task Tracker: Airtable (creates/updates a row per account)
"""

import os
import json
import logging
import requests
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")
ENABLE_LOCAL_FALLBACK = os.getenv("ENABLE_LOCAL_FALLBACK", "true").lower() == "true"

# Airtable config
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME", "Clara_Accounts")

# Session-level disable flags (avoid retrying 401 on every account)
_airtable_disabled = False

def get_supabase_client() -> Client | None:
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.warning(f"Supabase client init failed: {e}")
        return None


def ensure_account_exists(client, account_id: str, company_name: str = "", status: str = "demo_processed"):
    """Ensure an account row exists in the accounts table (foreign key dependency)."""
    try:
        client.table("accounts").upsert({
            "account_id": account_id,
            "company_name": company_name,
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }, on_conflict="account_id").execute()
    except Exception as e:
        logger.warning(f"Could not upsert account row: {e}")


def save_account_memo(account_id: str, version: str, memo: dict, source: str) -> bool:
    """Save account memo to Supabase. Falls back to local JSON if unavailable."""
    saved_to_supabase = False

    # Try Supabase first
    try:
        client = get_supabase_client()
        if client:
            # Ensure parent account row exists (foreign key)
            status = "demo_processed" if version == "v1" else "onboarding_processed"
            ensure_account_exists(client, account_id, memo.get("company_name", ""), status)
            
            client.table("account_memos").upsert({
                "account_id": account_id,
                "version": version,
                "memo": memo,
                "source": source,
                "created_at": datetime.utcnow().isoformat()
            }, on_conflict="account_id,version").execute()
            logger.info(f"Memo saved to Supabase: {account_id} {version}")
            saved_to_supabase = True
    except Exception as e:
        logger.warning(f"Supabase unavailable for memo save: {e}")

    # Always also save locally (either as fallback or as backup)
    if not saved_to_supabase or ENABLE_LOCAL_FALLBACK:
        local_path = f"{OUTPUT_DIR}/accounts/{account_id}/{version}/"
        os.makedirs(local_path, exist_ok=True)
        with open(f"{local_path}/account_memo.json", "w") as f:
            json.dump(memo, f, indent=2)
        if not saved_to_supabase:
            logger.warning(f"Memo saved locally (Supabase fallback): {local_path}")

    # Update Airtable task tracker
    pipeline = "A" if version == "v1" else "B"
    status = "v1_ready" if version == "v1" else "v2_ready"
    upsert_airtable_record(account_id, {
        "account_id": account_id,
        "company_name": memo.get("company_name", ""),
        "version": version,
        "status": status,
        "pipeline": pipeline
    })

    return True

def save_agent_spec(account_id: str, version: str, spec: dict) -> bool:
    """Save agent spec to Supabase. Falls back to local JSON if unavailable."""
    saved_to_supabase = False

    try:
        client = get_supabase_client()
        if client:
            client.table("agent_specs").upsert({
                "account_id": account_id,
                "version": version,
                "spec": spec,
                "created_at": datetime.utcnow().isoformat()
            }, on_conflict="account_id,version").execute()
            logger.info(f"Agent spec saved to Supabase: {account_id} {version}")
            saved_to_supabase = True
    except Exception as e:
        logger.warning(f"Supabase unavailable for agent spec save: {e}")

    if not saved_to_supabase or ENABLE_LOCAL_FALLBACK:
        local_path = f"{OUTPUT_DIR}/accounts/{account_id}/{version}/"
        os.makedirs(local_path, exist_ok=True)
        with open(f"{local_path}/agent_spec.json", "w") as f:
            json.dump(spec, f, indent=2)
        if not saved_to_supabase:
            logger.warning(f"Agent spec saved locally (Supabase fallback): {local_path}")

    return True

def load_v1_memo(account_id: str) -> dict | None:
    """Load v1 memo from Supabase, fallback to local file."""
    # Try Supabase first
    try:
        client = get_supabase_client()
        if client:
            result = client.table("account_memos").select("memo").eq("account_id", account_id).eq("version", "v1").execute()
            if result.data:
                logger.info(f"Loaded v1 memo from Supabase: {account_id}")
                return result.data[0]["memo"]
    except Exception as e:
        logger.warning(f"Could not load from Supabase: {e}")

    # Fallback to local file
    local_path = f"{OUTPUT_DIR}/accounts/{account_id}/v1/account_memo.json"
    if os.path.exists(local_path):
        with open(local_path) as f:
            logger.info(f"Loaded v1 memo from local file: {local_path}")
            return json.load(f)

    logger.error(f"v1 memo not found anywhere for account: {account_id}")
    return None

def save_changelog(account_id: str, changes_json: dict, summary: str) -> bool:
    """Save changelog to Supabase and local files."""
    try:
        client = get_supabase_client()
        if client:
            client.table("changelogs").upsert({
                "account_id": account_id,
                "changes_json": changes_json,
                "summary": summary,
                "total_fields_changed": len([c for c in changes_json.get("changes", []) if c["type"] == "updated"]),
                "total_fields_added": len([c for c in changes_json.get("changes", []) if c["type"] == "added"]),
                "total_fields_resolved": len([c for c in changes_json.get("changes", []) if c["type"] == "resolved"]),
                "created_at": datetime.utcnow().isoformat()
            }, on_conflict="account_id").execute()
            logger.info(f"Changelog saved to Supabase: {account_id}")
    except Exception as e:
        logger.warning(f"Supabase unavailable for changelog save: {e}")

    # Always save locally
    local_path = f"{OUTPUT_DIR}/accounts/{account_id}/v2/"
    os.makedirs(local_path, exist_ok=True)
    with open(f"{local_path}/changes.json", "w") as f:
        json.dump(changes_json, f, indent=2)

    return True

def log_pipeline_run(account_id: str, pipeline: str, status: str,
                     input_file: str = None, output_path: str = None,
                     error_message: str = None, duration_seconds: float = None):
    """Log every pipeline execution."""
    try:
        client = get_supabase_client()
        if client:
            client.table("pipeline_runs").insert({
                "account_id": account_id,
                "pipeline": pipeline,
                "status": status,
                "input_file": input_file,
                "output_path": output_path,
                "error_message": error_message,
                "duration_seconds": duration_seconds,
                "run_at": datetime.utcnow().isoformat()
            }).execute()
    except Exception as e:
        logger.warning(f"Could not log pipeline run to Supabase: {e}")


# ─── Airtable Integration ───────────────────────────────────────────────

def _airtable_headers():
    """Build Airtable API headers."""
    return {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

def _airtable_url():
    """Build Airtable API base URL."""
    return f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"

def _find_airtable_record(account_id: str) -> str | None:
    """Find an existing Airtable record by account_id. Returns record ID or None."""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        return None
    try:
        url = _airtable_url()
        params = {"filterByFormula": f"{{account_id}}='{account_id}'", "maxRecords": 1}
        resp = requests.get(url, headers=_airtable_headers(), params=params, timeout=10)
        resp.raise_for_status()
        records = resp.json().get("records", [])
        if records:
            return records[0]["id"]
    except Exception as e:
        logger.warning(f"Airtable lookup failed: {e}")
    return None

def upsert_airtable_record(account_id: str, fields: dict):
    """Create or update an Airtable record for the given account."""
    global _airtable_disabled
    if _airtable_disabled:
        return
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        logger.debug("Airtable not configured, skipping task tracker update")
        return

    try:
        record_id = _find_airtable_record(account_id)
        url = _airtable_url()

        if record_id:
            # Update existing record
            resp = requests.patch(
                f"{url}/{record_id}",
                headers=_airtable_headers(),
                json={"fields": fields},
                timeout=10
            )
            resp.raise_for_status()
            logger.info(f"Airtable updated: {account_id} (record {record_id})")
        else:
            # Create new record
            resp = requests.post(
                url,
                headers=_airtable_headers(),
                json={"fields": fields},
                timeout=10
            )
            resp.raise_for_status()
            logger.info(f"Airtable created: {account_id}")
    except Exception as e:
        logger.warning(f"Airtable upsert failed for {account_id}: {e}")
        if "401" in str(e):
            _airtable_disabled = True
            logger.warning("Airtable 401 — Invalid API key. Skipping Airtable for remaining batch.")

