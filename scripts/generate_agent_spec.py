import json
import logging
import os
from scripts.llm_client import call_llm

logger = logging.getLogger(__name__)

def generate_spec(account_id: str, account_memo: dict, version: str = "v1") -> dict:
    prompt_path = os.path.join("prompts", "agent_generation_prompt.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_text = f.read()
        
    parts = prompt_text.split("USER:")
    system_prompt = parts[0].replace("SYSTEM:\n", "").strip()
    user_prompt_template = parts[1].strip()
    
    user_prompt = user_prompt_template.replace("{account_id}", account_id)\
                                      .replace("{account_memo}", json.dumps(account_memo, indent=2))
                                      
    spec = call_llm(system_prompt, user_prompt)
    
    # Post-process: ensure version and source_memo_version match the actual version
    spec["version"] = version
    spec["source_memo_version"] = version
    
    return spec
