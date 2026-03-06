"""
Centralized LLM client with 6-position fallback chain.
All scripts should import call_llm from this module.

Fallback order:
1. Mistral mistral-medium-2505 (200K context, no chunking)
2. Mistral mistral-small-2506  (150K context, no chunking)
3. Gemini  gemini-2.5-flash-lite (150K context, no chunking)
4. Gemini  gemini-2.5-flash     (150K context, no chunking)
5. Groq   llama-3.3-70b-versatile (20K, chunking if needed)
6. Groq   llama-3.1-8b-instant    (14K, chunking if needed)
"""

import os
import json
import logging
import requests
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-medium-2505")
MISTRAL_FALLBACK_MODEL = os.getenv("MISTRAL_FALLBACK_MODEL", "mistral-small-2506")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-2.5-flash")

LLM_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "3"))
LLM_RETRY_DELAY = int(os.getenv("LLM_RETRY_DELAY", "2"))
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")
LOG_DIR = os.getenv("LOG_DIR", "./logs")

GROQ_CHUNK_SIZE = 14000
GROQ_CHUNK_OVERLAP = 500
GROQ_HEADER_SIZE = 2000
GROQ_FOOTER_SIZE = 2000

# Session-level disable flags (avoid retrying 401 on every account)
_mistral_disabled = False

# ─── Token Usage Tracking ─────────────────────────────────────────────
_token_usage = {
    "mistral": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
    "mistral_fallback": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
    "gemini": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
    "gemini_fallback": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
    "groq": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
    "groq_fallback": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "calls": 0},
}

def get_token_usage():
    return _token_usage.copy()

def save_token_usage_report():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    report = {
        "report_generated": datetime.utcnow().isoformat(),
        "mistral": {**_token_usage["mistral"], "model": MISTRAL_MODEL, "cost": "$0.00"},
        "mistral_fallback": {**_token_usage["mistral_fallback"], "model": MISTRAL_FALLBACK_MODEL, "cost": "$0.00"},
        "gemini": {**_token_usage["gemini"], "model": GEMINI_MODEL, "cost": "$0.00"},
        "gemini_fallback": {**_token_usage["gemini_fallback"], "model": GEMINI_FALLBACK_MODEL, "cost": "$0.00"},
        "groq": {**_token_usage["groq"], "model": GROQ_MODEL, "cost": "$0.00"},
        "groq_fallback": {**_token_usage["groq_fallback"], "model": GROQ_FALLBACK_MODEL, "cost": "$0.00"},
        "total_tokens_all_providers": sum(_token_usage[k]["total_tokens"] for k in _token_usage),
        "total_cost": "$0.00"
    }
    path = os.path.join(OUTPUT_DIR, "token_usage_report.json")
    with open(path, "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"Token usage report saved: {path}")
    return report


# ─── Error Logging ────────────────────────────────────────────────────

def log_error(message):
    os.makedirs(LOG_DIR, exist_ok=True)
    with open(os.path.join(LOG_DIR, "errors.log"), "a", encoding="utf-8") as f:
        f.write(f"[{datetime.utcnow().isoformat()}] {message}\n")
    logger.error(message)


# ─── Smart Chunking (for Groq only) ──────────────────────────────────

def smart_chunk_transcript(transcript, chunk_size=GROQ_CHUNK_SIZE,
                            header_size=GROQ_HEADER_SIZE, footer_size=GROQ_FOOTER_SIZE,
                            overlap=GROQ_CHUNK_OVERLAP):
    if len(transcript) <= chunk_size:
        return [transcript]
    header = transcript[:header_size]
    footer = transcript[-footer_size:]
    middle = transcript[header_size:-footer_size] if len(transcript) > header_size + footer_size else ""
    middle_budget = chunk_size - header_size - footer_size - 200
    if middle_budget <= 0:
        middle_budget = chunk_size // 2
    chunks = []
    start = 0
    while start < len(middle):
        end = min(start + middle_budget, len(middle))
        segment = middle[start:end]
        chunk = header + "\n\n[... MIDDLE SECTION ...]\n\n" + segment + "\n\n[... END ...]\n\n" + footer
        chunks.append(chunk)
        start = end - overlap if end < len(middle) else end
    if not chunks:
        chunks = [transcript[:chunk_size]]
    logger.info(f"Chunked: {len(transcript)} chars -> {len(chunks)} chunks (~{chunk_size} chars each)")
    return chunks


# ─── Merge Partial Memos ─────────────────────────────────────────────

LIST_MERGE_FIELDS = {"services_supported", "emergency_definition", "integration_constraints", "questions_or_unknowns"}

def merge_partial_memos(partials):
    if len(partials) == 1:
        return partials[0]
    merged = {}
    all_keys = set()
    for p in partials:
        if isinstance(p, dict):
            all_keys.update(p.keys())
    for key in all_keys:
        values = [p.get(key) for p in partials if isinstance(p, dict)]
        if key in LIST_MERGE_FIELDS:
            combined, seen = [], set()
            for v in values:
                if isinstance(v, list):
                    for item in v:
                        k = str(item).lower().strip()
                        if k and k not in seen:
                            combined.append(item)
                            seen.add(k)
            merged[key] = combined
        elif key in {"business_hours", "emergency_routing_rules", "non_emergency_routing_rules", "call_transfer_rules"}:
            merged_obj = {}
            for v in values:
                if isinstance(v, dict):
                    for sk, sv in v.items():
                        if sk not in merged_obj or merged_obj[sk] is None:
                            if sv is not None:
                                merged_obj[sk] = sv
            merged[key] = merged_obj if merged_obj else None
        else:
            merged[key] = None
            for v in values:
                if v is not None and v != "" and v != []:
                    merged[key] = v
                    break
    logger.info(f"Merged {len(partials)} partial memos into 1 complete memo")
    return merged


# ─── LLM Callers ─────────────────────────────────────────────────────

def _classify_429(error_str):
    """Classify 429 error type: 'per_minute', 'per_day', or 'generic'."""
    low = error_str.lower()
    if "per_day" in low or "daily" in low or "tokens per day" in low:
        return "per_day"
    if "per_minute" in low or "requests per minute" in low or "tokens per minute" in low:
        return "per_minute"
    return "generic"


def _call_mistral(model, system_prompt, user_prompt, tracker_key):
    """Call Mistral API. Supports json_object response format."""
    json_system = system_prompt + "\n\nYou MUST return your response as valid JSON only."
    max_retries = LLM_MAX_RETRIES
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling Mistral {model} (attempt {attempt + 1}/{max_retries})...")
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": json_system},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            response = requests.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"},
                json=data, timeout=180
            )
            response.raise_for_status()
            resp_json = response.json()

            usage = resp_json.get("usage", {})
            _token_usage[tracker_key]["prompt_tokens"] += usage.get("prompt_tokens", 0)
            _token_usage[tracker_key]["completion_tokens"] += usage.get("completion_tokens", 0)
            _token_usage[tracker_key]["total_tokens"] += usage.get("total_tokens", 0)
            _token_usage[tracker_key]["calls"] += 1
            logger.info(f"Mistral {model} tokens: {usage.get('total_tokens', '?')} "
                        f"(prompt: {usage.get('prompt_tokens', '?')}, completion: {usage.get('completion_tokens', '?')})")

            content = resp_json["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            err = str(e)
            logger.warning(f"Mistral {model} attempt {attempt + 1} failed: {err}")
            if "429" in err:
                kind = _classify_429(err)
                if kind == "per_day":
                    logger.info("Per-day limit hit. Skipping immediately.")
                    break
                elif kind == "per_minute":
                    logger.info("Per-minute limit. Waiting 60s, then retry once.")
                    time.sleep(60)
                    continue
                else:
                    logger.info("Generic 429. Waiting 60s then skipping.")
                    time.sleep(60)
                    break
            elif "500" in err or "503" in err:
                wait = LLM_RETRY_DELAY * (2 ** attempt)
                logger.info(f"Server error. Backoff {wait}s...")
                time.sleep(wait)
            else:
                # 401 = invalid key, disable Mistral for rest of session
                if "401" in err:
                    global _mistral_disabled
                    _mistral_disabled = True
                    logger.warning(f"Mistral 401 — Invalid API key. Skipping Mistral permanently for this session.")
                    break
                time.sleep(LLM_RETRY_DELAY)
    raise RuntimeError(f"Mistral {model} failed")


def _call_gemini(model, system_prompt, user_prompt, tracker_key):
    """Call Gemini API. No json_object mode, parses JSON from text."""
    max_attempts = 2
    for attempt in range(max_attempts):
        try:
            logger.info(f"Calling Gemini {model} (attempt {attempt + 1}/{max_attempts})...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            combined = (f"System: {system_prompt}\n\nUser: {user_prompt}\n\n"
                        "Return EXACTLY a JSON object. No backticks, no markdown.")
            data = {
                "contents": [{"parts": [{"text": combined}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            res = requests.post(url, headers={"Content-Type": "application/json"}, json=data, timeout=180)
            res.raise_for_status()
            resp_json = res.json()

            um = resp_json.get("usageMetadata", {})
            pt = um.get("promptTokenCount", 0)
            ct = um.get("candidatesTokenCount", 0)
            tt = um.get("totalTokenCount", pt + ct)
            _token_usage[tracker_key]["prompt_tokens"] += pt
            _token_usage[tracker_key]["completion_tokens"] += ct
            _token_usage[tracker_key]["total_tokens"] += tt
            _token_usage[tracker_key]["calls"] += 1
            logger.info(f"Gemini {model} tokens: {tt} (prompt: {pt}, completion: {ct})")

            content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            err = str(e)
            logger.warning(f"Gemini {model} attempt {attempt + 1} failed: {err}")
            if "429" in err and attempt < max_attempts - 1:
                logger.info("Gemini 429. Waiting 60s then skipping.")
                time.sleep(60)
            else:
                time.sleep(LLM_RETRY_DELAY)
    raise RuntimeError(f"Gemini {model} failed")


def _call_groq(model, system_prompt, user_prompt, tracker_key):
    """Call Groq API. Supports json_object mode. Used for chunks."""
    json_system = system_prompt + "\n\nYou MUST return your response as valid JSON only."
    max_retries = LLM_MAX_RETRIES
    for attempt in range(max_retries):
        try:
            time.sleep(2)  # 2s inter-call delay
            logger.info(f"Calling Groq {model} (attempt {attempt + 1}/{max_retries})...")
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": json_system},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json=data, timeout=120
            )
            response.raise_for_status()
            resp_json = response.json()

            usage = resp_json.get("usage", {})
            _token_usage[tracker_key]["prompt_tokens"] += usage.get("prompt_tokens", 0)
            _token_usage[tracker_key]["completion_tokens"] += usage.get("completion_tokens", 0)
            _token_usage[tracker_key]["total_tokens"] += usage.get("total_tokens", 0)
            _token_usage[tracker_key]["calls"] += 1
            logger.info(f"Groq {model} tokens: {usage.get('total_tokens', '?')}")

            content = resp_json["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            err = str(e)
            logger.warning(f"Groq {model} attempt {attempt + 1} failed: {err}")
            if "429" in err:
                kind = _classify_429(err)
                if kind == "per_day":
                    logger.info("Per-day limit hit. Skipping immediately.")
                    break
                elif kind == "per_minute":
                    logger.info("Per-minute limit. Waiting 60s, retry once.")
                    time.sleep(60)
                    continue
                else:
                    logger.info("Generic 429. Waiting 60s then skipping.")
                    time.sleep(60)
                    break
            elif "413" in err:
                logger.warning(f"Payload too large for {model}. Skipping.")
                break
            elif "500" in err or "503" in err:
                wait = LLM_RETRY_DELAY * (2 ** attempt)
                logger.info(f"Server error. Backoff {wait}s...")
                time.sleep(wait)
            else:
                time.sleep(LLM_RETRY_DELAY)
    raise RuntimeError(f"Groq {model} failed")


def _extract_chunked_groq(account_id, transcript, system_prompt, model, tracker_key):
    """Split transcript into chunks, extract partial memos via Groq, merge."""
    chunk_size = 20000 if "70b" in model else 14000
    chunks = smart_chunk_transcript(transcript, chunk_size=chunk_size)
    partials = []
    for i, chunk in enumerate(chunks, 1):
        chunk_prompt = (
            f"This is PART {i} of {len(chunks)} of a call transcript for account '{account_id}'.\n"
            f"Extract whatever business information you can find in THIS PART ONLY.\n"
            f"Return partial JSON with only fields you found. Set others to null.\n\n"
            f"TRANSCRIPT PART {i}/{len(chunks)}:\n{chunk}"
        )
        logger.info(f"[{account_id}] Chunk {i}/{len(chunks)} ({len(chunk)} chars)...")
        try:
            partial = _call_groq(model, system_prompt, chunk_prompt, tracker_key)
            partials.append(partial)
            logger.info(f"[{account_id}] Chunk {i}/{len(chunks)} OK")
        except RuntimeError as e:
            logger.warning(f"[{account_id}] Chunk {i}/{len(chunks)} failed: {e}")
            log_error(f"[{account_id}] Chunk {i}/{len(chunks)} with {model} failed: {e}")
    if not partials:
        raise RuntimeError(f"All chunks failed for {account_id} with {model}")
    merged = merge_partial_memos(partials)
    if len(chunks) > 1:
        if "questions_or_unknowns" not in merged or merged["questions_or_unknowns"] is None:
            merged["questions_or_unknowns"] = []
        merged["questions_or_unknowns"].append(
            f"Transcript processed in {len(chunks)} chunks. Manual review recommended."
        )
    return merged


# ─── Main Dispatcher ─────────────────────────────────────────────────

def call_llm(system_prompt, user_prompt, account_id="unknown", transcript=""):
    """6-position fallback chain.
    Positions 1-4: full transcript (Mistral/Gemini have huge context).
    Positions 5-6: chunked (Groq has small context).
    """
    # Positions 1-4: full transcript, no chunking
    full_stages = [
        ("Mistral", MISTRAL_MODEL,          "mistral",          _call_mistral),
        ("Mistral", MISTRAL_FALLBACK_MODEL,  "mistral_fallback", _call_mistral),
        ("Gemini",  GEMINI_MODEL,            "gemini",           _call_gemini),
        ("Gemini",  GEMINI_FALLBACK_MODEL,   "gemini_fallback",  _call_gemini),
    ]

    for i, (provider, model, tracker, caller) in enumerate(full_stages, 1):
        # Skip disabled providers
        if provider == "Mistral" and _mistral_disabled:
            logger.info(f"[{account_id}] Position {i}: Skipping {provider} {model} (disabled — 401 invalid key)")
            continue
        try:
            logger.info(f"[{account_id}] Position {i}: {provider} {model}")
            return caller(model, system_prompt, user_prompt, tracker)
        except RuntimeError as e:
            log_error(f"[{account_id}] Position {i} {provider} {model} failed: {e}")
            if i < len(full_stages):
                logger.info(f"[{account_id}] Falling back to Position {i+1}...")

    # Positions 5-6: chunked Groq (only if transcript available)
    if transcript:
        groq_stages = [
            ("Groq", GROQ_MODEL,          "groq",          5),
            ("Groq", GROQ_FALLBACK_MODEL,  "groq_fallback", 6),
        ]
        for provider, model, tracker, pos in groq_stages:
            try:
                logger.info(f"[{account_id}] Position {pos}: {provider} {model} (chunked)")
                return _extract_chunked_groq(account_id, transcript, system_prompt, model, tracker)
            except RuntimeError as e:
                log_error(f"[{account_id}] Position {pos} {provider} {model} chunked failed: {e}")
                if pos < 6:
                    logger.info(f"[{account_id}] Falling back to Position {pos+1}...")

    # ALL failed
    error_msg = (f"[{account_id}] ALL 6 LLM positions failed: "
                 f"Mistral {MISTRAL_MODEL} -> Mistral {MISTRAL_FALLBACK_MODEL} -> "
                 f"Gemini {GEMINI_MODEL} -> Gemini {GEMINI_FALLBACK_MODEL} -> "
                 f"Groq {GROQ_MODEL} -> Groq {GROQ_FALLBACK_MODEL}")
    log_error(error_msg)
    raise RuntimeError(error_msg)
