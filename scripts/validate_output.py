import json
import logging
import re
import jsonschema
import os
from typing import Dict, Any, Tuple, List

logger = logging.getLogger(__name__)


def validate_against_schema(data: Dict[str, Any], schema_path: str) -> Tuple[bool, str]:
    """Rule 6: Schema validation — all outputs validated against JSON schemas."""
    try:
        with open(schema_path) as f:
            schema = json.load(f)
        jsonschema.validate(instance=data, schema=schema)
        return True, "Valid"
    except Exception as e:
        return False, f"Schema validation failed: {e}"


def count_nulls(obj: Any) -> int:
    nulls = 0
    if isinstance(obj, dict):
        for k, v in obj.items():
            if v is None:
                nulls += 1
            else:
                nulls += count_nulls(v)
    elif isinstance(obj, list):
        for item in obj:
            if item is None:
                nulls += 1
            else:
                nulls += count_nulls(item)
    return nulls


def normalize_text(text: str) -> str:
    """Normalize text for fuzzy comparison: lowercase, collapse whitespace, strip punctuation."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def extract_digits(text: str) -> str:
    """Extract only digits from text for phone number comparison."""
    return re.sub(r'\D', '', text)


def fuzzy_match(value: str, transcript: str, threshold: float = 0.7) -> bool:
    """Check if a value appears in the transcript using fuzzy word matching.
    
    Returns True if at least `threshold` fraction of words in value exist in transcript.
    Also does exact digit matching for phone numbers.
    """
    # First try exact match
    if value.lower() in transcript.lower():
        return True
    
    # For phone numbers: compare digits only
    digits = extract_digits(value)
    if len(digits) >= 7:  # Looks like a phone number
        transcript_digits = extract_digits(transcript)
        if digits in transcript_digits:
            return True
        return False
    
    # For addresses and other text: check word overlap
    norm_value = normalize_text(value)
    norm_transcript = normalize_text(transcript)
    
    value_words = norm_value.split()
    if not value_words:
        return True
    
    # Remove common filler words that may differ between transcript and extraction
    skip_words = {"the", "a", "an", "and", "or", "of", "in", "at", "to", "for", "is", "are", "was", "were"}
    meaningful_words = [w for w in value_words if w not in skip_words and len(w) > 1]
    
    if not meaningful_words:
        return True
    
    matched = sum(1 for w in meaningful_words if w in norm_transcript)
    match_ratio = matched / len(meaningful_words)
    
    return match_ratio >= threshold


def validate_memo(memo: Dict[str, Any], transcript: str) -> Tuple[bool, str]:
    """Applies domain rules to the extracted memo."""
    warnings = []
    
    # Rule 1: No null in required fields
    required = ["account_id", "company_name", "version", "source"]
    for field in required:
        if memo.get(field) is None:
            return False, f"Rule 1 failed: Required field '{field}' is null"

    # Rule 2: Hallucination guard (fuzzy matching)
    checks = []
    if memo.get("office_address"):
        checks.append(("office_address", memo["office_address"]))
    
    if memo.get("emergency_routing_rules") and isinstance(memo["emergency_routing_rules"], dict):
        er = memo["emergency_routing_rules"]
        if er.get("primary_contact"):
            checks.append(("emergency_routing_rules.primary_contact", er["primary_contact"]))
        if er.get("primary_phone"):
            checks.append(("emergency_routing_rules.primary_phone", er["primary_phone"]))

    if memo.get("company_name"):
        checks.append(("company_name", memo["company_name"]))

    for field_name, val in checks:
        if isinstance(val, str) and val.strip():
            if not fuzzy_match(val, transcript):
                return False, f"Rule 2 failed: Potential hallucination in '{field_name}': '{val}' not found in transcript"

    # Rule 3: questions_or_unknowns completeness
    null_count = count_nulls(memo)
    q_or_u = memo.get("questions_or_unknowns", [])
    if null_count > 4 and len(q_or_u) < 3:
        warnings.append(f"Rule 3 warning: {null_count} nulls but only {len(q_or_u)} questions_or_unknowns")
        logger.warning(warnings[-1])

    # Rule 4: services_supported should not be empty if mentioned in transcript
    services = memo.get("services_supported", [])
    if not services:
        logger.warning("Rule 4 warning: services_supported is empty")

    if warnings:
        return True, f"Valid with warnings: {'; '.join(warnings)}"
    return True, "Valid"


def validate_v2_against_v1(v1_memo: Dict[str, Any], v2_memo: Dict[str, Any]) -> Tuple[bool, str]:
    """Rule 4: Version integrity — v2 must not lose data from v1."""
    if v2_memo.get("version") != "v2":
        return False, "Rule 4 failed: v2 memo must have version 'v2'"
    
    # Check critical fields aren't lost
    if v1_memo.get("account_id") != v2_memo.get("account_id"):
        return False, "Rule 4 failed: account_id changed between v1 and v2"
    
    if v1_memo.get("company_name") != v2_memo.get("company_name"):
        logger.warning(f"Warning: company_name changed from '{v1_memo.get('company_name')}' to '{v2_memo.get('company_name')}'")
    
    # Check that v1 services aren't dropped in v2
    v1_services = set(v1_memo.get("services_supported", []))
    v2_services = set(v2_memo.get("services_supported", []))
    dropped = v1_services - v2_services
    if dropped:
        logger.warning(f"Warning: Services dropped from v1→v2: {dropped}")
    
    return True, "Valid"


def validate_agent_placeholders(v1_spec: dict, v2_spec: dict) -> Tuple[bool, str]:
    """Rule 7: Placeholder check — v2 should resolve v1 placeholders."""
    v1_ph = set(v1_spec.get("placeholders_requiring_manual_fill", []))
    v2_ph = set(v2_spec.get("placeholders_requiring_manual_fill", []))
    overlap = v1_ph.intersection(v2_ph)
    if overlap:
        logger.warning(f"Rule 7 warning: V1 placeholders still in V2: {overlap}")
    return True, "Valid"


def validate_agent_spec(spec: dict) -> Tuple[bool, str]:
    """Validate agent spec prompt hygiene."""
    warnings = []
    prompt_text = spec.get("system_prompt", "").lower()
    
    # Check for forbidden words that should never be exposed to callers
    forbidden = ["function calls", "tools", "api"]
    for word in forbidden:
        if word in prompt_text:
            warnings.append(f"Agent spec contains forbidden word: '{word}'")
            logger.warning(f"Prompt hygiene: {warnings[-1]}")
    
    # Check required flow elements exist
    required_elements = [
        ("greeting", ["greet", "hello", "welcome", "good morning", "good afternoon"]),
        ("name collection", ["name", "who am i speaking"]),
        ("callback number", ["number", "phone", "callback", "reach you"]),
        ("emergency check", ["emergency", "urgent"]),
        ("transfer", ["transfer", "connect", "reach", "get someone"]),
        ("fallback", ["apologize", "sorry", "callback", "call you back", "follow up"]),
        ("closing", ["anything else", "else i can help", "have a great"]),
    ]
    
    for element_name, keywords in required_elements:
        if not any(kw in prompt_text for kw in keywords):
            warnings.append(f"Missing flow element: {element_name}")
    
    if warnings:
        return True, f"Valid with warnings: {'; '.join(warnings)}"
    return True, "Valid"
