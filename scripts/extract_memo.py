"""Extract account memo from a transcript. Uses centralized llm_client."""
import os
import json
import logging
from datetime import datetime
from scripts.llm_client import call_llm, save_token_usage_report, get_token_usage, log_error

logger = logging.getLogger(__name__)
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")

# ─── Schema-Aware Field Lists ────────────────────────────────────────

# Fields that MUST be arrays of strings
ARRAY_OF_STRING_FIELDS = [
    "services_supported",
    "emergency_definition",
    "integration_constraints",
    "questions_or_unknowns",
]

# Fields that MUST be objects (dicts)
OBJECT_FIELDS = [
    "business_hours",
    "emergency_routing_rules",
    "non_emergency_routing_rules",
    "call_transfer_rules",
]

# Top-level fields that MUST be string or null
STRING_OR_NULL_FIELDS = [
    "after_hours_flow_summary",
    "office_hours_flow_summary",
    "office_address",
    "notes",
]


# ─── Helpers ─────────────────────────────────────────────────────────

def _to_routing_string(item):
    """Convert a routing_order item to a string. Handles dicts like {contact: 'Ben', phone: '403-975-1773'}."""
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        phone = item.get("phone") or item.get("number") or item.get("cell")
        name = item.get("contact") or item.get("name") or item.get("person")
        if phone and name:
            return f"{name}: {phone}"
        if phone:
            return str(phone)
        return str(item)
    return str(item)


def _coerce_to_string(value):
    """Convert any non-string value to a JSON string. Returns None for empty/null."""
    if value is None:
        return None
    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list)):
        return json.dumps(value) if value else None
    return str(value)


def _coerce_to_string_list(value):
    """Convert any value to a list of strings."""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) if not isinstance(item, str) else item for item in value]
    if isinstance(value, str):
        # Try to parse JSON array
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(item) for item in parsed]
        except (json.JSONDecodeError, TypeError):
            pass
        return [value]
    if isinstance(value, dict):
        return list(str(v) for v in value.values())
    return [str(value)]


# ─── Main Normalization Function ─────────────────────────────────────

def normalize_memo_fields(memo: dict) -> dict:
    """
    Comprehensive post-processing normalizer for LLM-generated memos.
    Ensures every field matches the expected schema type, handling common
    LLM output variations (dicts where strings expected, strings where
    lists expected, etc.).
    """
    if not isinstance(memo, dict):
        return memo

    # 1. Top-level string-or-null fields: dict/list → JSON string
    for field in STRING_OR_NULL_FIELDS:
        if field in memo:
            memo[field] = _coerce_to_string(memo[field])

    # 2. Array-of-string fields: null → [], string → [string], dict → values
    for field in ARRAY_OF_STRING_FIELDS:
        if field in memo:
            memo[field] = _coerce_to_string_list(memo[field])

    # 3. Object fields: null → {}
    for field in OBJECT_FIELDS:
        if field in memo and memo[field] is None:
            memo[field] = {}

    # 4. business_hours: sub-fields must be string|null
    if isinstance(memo.get("business_hours"), dict):
        for sub in ["days", "start", "end", "timezone"]:
            val = memo["business_hours"].get(sub)
            if isinstance(val, list):
                memo["business_hours"][sub] = ", ".join(str(v) for v in val)
            elif isinstance(val, dict):
                memo["business_hours"][sub] = json.dumps(val)

    # 5. emergency_routing_rules: routing_order must be array of strings
    if isinstance(memo.get("emergency_routing_rules"), dict):
        ro = memo["emergency_routing_rules"].get("routing_order")
        if ro is None:
            memo["emergency_routing_rules"]["routing_order"] = []
        elif isinstance(ro, dict):
            flat = []
            seen = set()
            for v in ro.values():
                if isinstance(v, list):
                    for item in v:
                        s = _to_routing_string(item)
                        if s and s not in seen:
                            flat.append(s)
                            seen.add(s)
                elif isinstance(v, str) and v not in seen:
                    flat.append(v)
                    seen.add(v)
            memo["emergency_routing_rules"]["routing_order"] = flat
        elif isinstance(ro, list):
            memo["emergency_routing_rules"]["routing_order"] = [
                _to_routing_string(item) for item in ro
            ]
        # fallback_action, primary_contact, primary_phone must be string|null
        for sub in ["primary_contact", "primary_phone", "fallback_action"]:
            val = memo["emergency_routing_rules"].get(sub)
            if isinstance(val, (dict, list)):
                memo["emergency_routing_rules"][sub] = _coerce_to_string(val)

    # 6. non_emergency_routing_rules: action and details must be string|null
    if isinstance(memo.get("non_emergency_routing_rules"), dict):
        for sub in ["action", "details"]:
            val = memo["non_emergency_routing_rules"].get(sub)
            if isinstance(val, (dict, list)):
                memo["non_emergency_routing_rules"][sub] = _coerce_to_string(val)

    # 7. call_transfer_rules: timeout_seconds/retries must be number|null
    if isinstance(memo.get("call_transfer_rules"), dict):
        for sub in ["timeout_seconds", "retries"]:
            val = memo["call_transfer_rules"].get(sub)
            if isinstance(val, str) and val.isdigit():
                memo["call_transfer_rules"][sub] = int(val)
        # message_on_fail must be string|null
        mof = memo["call_transfer_rules"].get("message_on_fail")
        if isinstance(mof, (dict, list)):
            memo["call_transfer_rules"]["message_on_fail"] = _coerce_to_string(mof)

    return memo


# Legacy alias — called from batch_run.py
def cleanup_memo(memo):
    """Normalize all memo fields to match schema. Legacy entry point."""
    return normalize_memo_fields(memo)


# ─── Main Entry Point ────────────────────────────────────────────────

def extract_memo(account_id, transcript):
    """Extract an account memo from a transcript using the centralized LLM client."""
    if not transcript or not transcript.strip():
        error_msg = f"[{account_id}] Empty transcript provided"
        log_error(error_msg)
        raise ValueError(error_msg)

    prompt_path = os.path.join("prompts", "extraction_prompt.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_text = f.read()

    parts = prompt_text.split("USER:")
    system_prompt = parts[0].replace("SYSTEM:\n", "").strip()
    user_prompt_template = parts[1].strip()

    user_prompt = user_prompt_template.replace("{account_id}", account_id).replace("{transcript}", transcript)

    logger.info(f"[{account_id}] Transcript: {len(transcript)} chars (~{len(transcript) // 4} tokens)")

    result = call_llm(system_prompt, user_prompt, account_id=account_id, transcript=transcript)
    return normalize_memo_fields(result)
