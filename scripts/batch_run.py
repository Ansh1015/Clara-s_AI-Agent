import os
import argparse
import time
import json
import logging
import sys

# Force UTF-8 encoding on Windows to handle emoji in log messages
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from tabulate import tabulate
from datetime import datetime

# Add the project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.extract_memo import extract_memo, cleanup_memo
from scripts.llm_client import save_token_usage_report
from scripts.generate_agent_spec import generate_spec
from scripts.apply_patch import extract_patch, apply_patch
from scripts.generate_changelog import generate_changelog
from scripts.validate_output import validate_memo, validate_against_schema, validate_agent_spec, validate_v2_against_v1, validate_agent_placeholders
from scripts.storage import save_account_memo, save_agent_spec, save_changelog, log_pipeline_run, load_v1_memo


def setup_logging():
    """Setup dual logging: console + file."""
    os.makedirs("logs", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join("logs", f"pipeline_run_{timestamp}.log")

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(console_fmt)

    # File handler
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler.setFormatter(file_fmt)

    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    return log_file


logger = logging.getLogger("BatchRunner")


def output_exists(account_id: str, version: str) -> bool:
    """Check if outputs already exist for the given account and version."""
    output_dir = os.path.join("outputs", "accounts", account_id, version)
    memo_path = os.path.join(output_dir, "account_memo.json")
    spec_path = os.path.join(output_dir, "agent_spec.json")
    return os.path.exists(memo_path) and os.path.exists(spec_path)


def run_pipeline_a(account_id: str, transcript_path: str, force: bool = False) -> tuple:
    start_time = time.time()
    try:
        # Idempotency check
        if not force and output_exists(account_id, "v1"):
            logger.info(f"[{account_id}] ⏭️ Skipping Pipeline A — v1 outputs already exist. Use --force to overwrite.")
            return True, f"outputs/accounts/{account_id}/v1/ (cached)"

        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript = f.read()

        logger.info(f"[{account_id}] Running Pipeline A: Extracting memo...")
        memo_v1 = extract_memo(account_id, transcript)
        
        valid_schema, schema_err = validate_against_schema(memo_v1, "schemas/account_memo_schema.json")
        if not valid_schema: raise ValueError(schema_err)
            
        valid_rules, rule_err = validate_memo(memo_v1, transcript)
        if not valid_rules: logger.warning(f"[{account_id}] Memo rules warning: {rule_err}")
        
        logger.info(f"[{account_id}] Generating v1 Agent Spec...")
        spec_v1 = generate_spec(account_id, memo_v1, version="v1")
        valid_spec_schema, specs_err = validate_against_schema(spec_v1, "schemas/agent_spec_schema.json")
        if not valid_spec_schema: raise ValueError(specs_err)
        
        save_account_memo(account_id, "v1", memo_v1, "demo_call")
        save_agent_spec(account_id, "v1", spec_v1)
        
        dur = time.time() - start_time
        log_pipeline_run(account_id, "A", "completed", transcript_path, f"outputs/accounts/{account_id}/v1/", None, dur)
        return True, f"outputs/accounts/{account_id}/v1/"
    except Exception as e:
        dur = time.time() - start_time
        logger.error(f"[{account_id}] Pipeline A Failed: {e}")
        log_pipeline_run(account_id, "A", "failed", transcript_path, None, str(e), dur)
        return False, f"Error: {e}"


def run_pipeline_b(account_id: str, transcript_path: str, force: bool = False) -> tuple:
    start_time = time.time()
    try:
        # Idempotency check
        if not force and output_exists(account_id, "v2"):
            logger.info(f"[{account_id}] ⏭️ Skipping Pipeline B — v2 outputs already exist. Use --force to overwrite.")
            return True, f"outputs/accounts/{account_id}/v2/ (cached)"

        v1_memo = load_v1_memo(account_id)
        if not v1_memo:
            raise ValueError("v1 memo not found anywhere — run Pipeline A first")
            
        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript = f.read()
            
        logger.info(f"[{account_id}] Running Pipeline B: Extracting patch...")
        patch = extract_patch(account_id, v1_memo, transcript)
        v2_memo = cleanup_memo(apply_patch(v1_memo, patch))
        
        valid_schema, schema_err = validate_against_schema(v2_memo, "schemas/account_memo_schema.json")
        if not valid_schema: raise ValueError(schema_err)
        
        valid_prog, rule_err = validate_v2_against_v1(v1_memo, v2_memo)
        if not valid_prog: raise ValueError(rule_err)
        
        logger.info(f"[{account_id}] Generating v2 Agent Spec...")
        spec_v2 = generate_spec(account_id, v2_memo, version="v2")
        valid_spec_schema, specs_err = validate_against_schema(spec_v2, "schemas/agent_spec_schema.json")
        if not valid_spec_schema: raise ValueError(specs_err)
        
        logger.info(f"[{account_id}] Generating Changelog...")
        changes_json, changes_md = generate_changelog(v1_memo, v2_memo, patch)
        
        save_account_memo(account_id, "v2", v2_memo, "onboarding_call")
        save_agent_spec(account_id, "v2", spec_v2)
        save_changelog(account_id, changes_json, changes_md.replace('\n', ' '))
        
        local_v2 = f"outputs/accounts/{account_id}/v2"
        os.makedirs(local_v2, exist_ok=True)
        with open(f"{local_v2}/changes.md", "w", encoding="utf-8") as f:
            f.write(changes_md)
            
        dur = time.time() - start_time
        log_pipeline_run(account_id, "B", "completed", transcript_path, f"outputs/accounts/{account_id}/v2/", None, dur)
        return True, f"outputs/accounts/{account_id}/v2/"
    except Exception as e:
        dur = time.time() - start_time
        logger.error(f"[{account_id}] Pipeline B Failed: {e}")
        log_pipeline_run(account_id, "B", "failed", transcript_path, None, str(e), dur)
        return False, f"Error: {e}"


def discover_files(directory: str, suffix: str):
    files = []
    if os.path.exists(directory):
        for f in os.listdir(directory):
            if f.endswith(suffix):
                acc_id = f.replace(suffix, "")
                files.append((acc_id, os.path.join(directory, f)))
    return files


def save_batch_report(results: list, duration: float, success_count: int, fail_count: int):
    """Save a batch summary report as JSON to outputs/."""
    os.makedirs("outputs", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    report = {
        "run_timestamp": datetime.now().isoformat(),
        "total_runs": len(results),
        "succeeded": success_count,
        "failed": fail_count,
        "total_duration_seconds": round(duration, 2),
        "avg_duration_per_run_seconds": round(duration / max(len(results), 1), 2),
        "results": [
            {
                "account_id": r[0],
                "pipeline": r[1],
                "status": r[2],
                "output_path": r[3]
            }
            for r in results
        ]
    }
    
    report_path = os.path.join("outputs", f"batch_report_{timestamp}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    
    # Also save as latest
    latest_path = os.path.join("outputs", "batch_report_latest.json")
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"📊 Batch report saved: {report_path}")
    return report_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Clara AI Batch Runner")
    parser.add_argument("--pipeline", choices=["A", "B"], help="Run A (Demo) or B (Onboarding)")
    parser.add_argument("--all", action="store_true", help="Run both pipelines end-to-end")
    parser.add_argument("--account", type=str, help="Single account ID to run")
    parser.add_argument("--force", action="store_true", help="Force re-run even if outputs already exist")
    args = parser.parse_args()

    log_file = setup_logging()
    logger.info(f"📝 Log file: {log_file}")

    results = []
    start_total = time.time()
    
    tasks = []
    if args.all or args.pipeline == "A":
        demos = discover_files("data/demo", "_demo.txt")
        for acc_id, path in demos:
            if args.account and acc_id != args.account: continue
            tasks.append((acc_id, "A", path))
    
    if args.all or args.pipeline == "B":
        onboards = discover_files("data/onboarding", "_onboarding.txt")
        for acc_id, path in onboards:
            if args.account and acc_id != args.account: continue
            tasks.append((acc_id, "B", path))

    if not tasks:
        logger.warning("No tasks found. Check data/demo/ and data/onboarding/ directories.")
        sys.exit(0)

    logger.info(f"🚀 Starting batch run: {len(tasks)} task(s), force={args.force}")
            
    success_count = 0
    fail_count = 0
    
    for i, (acc_id, pipe, path) in enumerate(tasks, 1):
        logger.info(f"--- [{i}/{len(tasks)}] {acc_id} Pipeline {pipe} ---")
        if pipe == "A":
            success, output = run_pipeline_a(acc_id, path, force=args.force)
        else:
            success, output = run_pipeline_b(acc_id, path, force=args.force)
        status = "SUCCESS" if success else "FAILED"
        if success: success_count += 1
        else: fail_count += 1
        results.append([acc_id, pipe, status, output])
        
    duration = time.time() - start_total
    
    print("\n" + tabulate(results, headers=["Account ID", "Pipeline", "Status", "Output Path"], tablefmt="grid"))
    print(f"Total: {len(tasks)} runs | {success_count} succeeded | {fail_count} failed | Duration: {duration:.1f}s")
    
    # Save batch report
    report_path = save_batch_report(results, duration, success_count, fail_count)
    print(f"Report: {report_path}")
    
    # Save token usage report for zero-cost compliance
    token_report = save_token_usage_report()
    total_tokens = token_report.get("total_tokens_all_providers", 0)
    print(f"Token usage: Total={total_tokens} tokens | Total cost: $0.00")

