import json
import logging
import copy
import os
from datetime import datetime
from scripts.llm_client import call_llm

logger = logging.getLogger(__name__)

def extract_patch(account_id: str, v1_memo: dict, onboarding_transcript: str) -> dict:
    prompt_path = os.path.join("prompts", "patch_prompt.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_text = f.read()
        
    parts = prompt_text.split("USER:")
    system_prompt = parts[0].replace("SYSTEM:\n", "").strip()
    user_prompt_template = parts[1].strip()
    
    user_prompt = user_prompt_template.replace("{account_id}", account_id)\
                                      .replace("{v1_memo}", json.dumps(v1_memo, indent=2))\
                                      .replace("{onboarding_transcript}", onboarding_transcript)
                                      
    return call_llm(system_prompt, user_prompt)

def _merge_list(v1_list: list, v2_list: list) -> list:
    """Merge two lists, preserving all v1 items and adding new v2 items (case-insensitive dedup)."""
    seen = {str(item).lower() for item in v1_list}
    merged = list(v1_list)
    for item in v2_list:
        if str(item).lower() not in seen:
            merged.append(item)
            seen.add(str(item).lower())
    return merged

# Fields that should be merged (union) rather than replaced
MERGE_LIST_FIELDS = {"services_supported", "emergency_definition", "integration_constraints"}

def apply_patch(v1_memo: dict, patch: dict) -> dict:
    """Merges the v1_memo with the extracted patch to produce v2_memo."""
    v2_memo = copy.deepcopy(v1_memo)
    v2_memo["version"] = "v2"
    v2_memo["source"] = "onboarding_call"
    v2_memo["created_at"] = datetime.utcnow().isoformat()
    
    # Normalize patch structure: LLM may return list instead of dict
    updated_fields = patch.get("updated_fields", {})
    if isinstance(updated_fields, list):
        # Convert list of {field, new_value, ...} into dict
        updated_fields = {
            item.get("field", item.get("field_path", f"unknown_{i}")): item
            for i, item in enumerate(updated_fields) if isinstance(item, dict)
        }
    if not isinstance(updated_fields, dict):
        updated_fields = {}

    new_fields = patch.get("new_fields", {})
    if isinstance(new_fields, list):
        new_fields = {
            item.get("field", item.get("field_name", f"unknown_{i}")): item.get("value", item.get("new_value"))
            for i, item in enumerate(new_fields) if isinstance(item, dict)
        }
    if not isinstance(new_fields, dict):
        new_fields = {}
    
    # 1. Update existing fields
    for field_path, data in updated_fields.items():
        keys = field_path.split(".")
        final_key = keys[-1]
        target = v2_memo
        for k in keys[:-1]:
            target = target.setdefault(k, {})
        
        new_value = data.get("new_value") if isinstance(data, dict) else data
        
        # For list fields: merge instead of replace to avoid losing v1 data
        if final_key in MERGE_LIST_FIELDS and isinstance(new_value, list):
            old_value = target.get(final_key, []) or []
            if isinstance(old_value, list):
                target[final_key] = _merge_list(old_value, new_value)
                logger.info(f"Merged list field '{field_path}': {len(old_value)} v1 + {len(new_value)} patch -> {len(target[final_key])} merged")
            else:
                target[final_key] = new_value
        else:
            target[final_key] = new_value
        
    # 2. Add new fields
    for field_name, value in new_fields.items():
        # For list fields: merge with existing
        if field_name in MERGE_LIST_FIELDS and isinstance(value, list):
            old = v2_memo.get(field_name, []) or []
            if isinstance(old, list):
                v2_memo[field_name] = _merge_list(old, value)
            else:
                v2_memo[field_name] = value
        else:
            v2_memo[field_name] = value
        
    # 3. Handle questions_or_unknowns resolving
    resolved = patch.get("resolved_unknowns", [])
    if isinstance(resolved, dict):
        resolved = list(resolved.values())
    if not isinstance(resolved, list):
        resolved = []
    if resolved and "questions_or_unknowns" in v2_memo:
        v2_memo["questions_or_unknowns"] = [
            q for q in v2_memo["questions_or_unknowns"]
            if q not in resolved
        ]
        
    # 4. Handle remaining_unknowns
    remaining = patch.get("remaining_unknowns", [])
    if isinstance(remaining, list) and remaining:
        v2_memo["questions_or_unknowns"] = remaining
        
    # 5. Handle integration constraints added
    constraints_added = patch.get("integration_constraints_added", [])
    if isinstance(constraints_added, list) and constraints_added:
        existing = v2_memo.get("integration_constraints", [])
        # Normalize to list if LLM returned dict or other type
        if isinstance(existing, dict):
            existing = list(existing.values())
        if not isinstance(existing, list):
            existing = []
        v2_memo["integration_constraints"] = existing
        for c in constraints_added:
            if c not in v2_memo["integration_constraints"]:
                v2_memo["integration_constraints"].append(c)
                
    return v2_memo
