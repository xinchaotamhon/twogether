#!/usr/bin/env python3
"""Run cumulative gates from gates/gates.json without shell interpolation."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

ORDER = {"smoke": 0, "regression": 1, "promotion": 2}


def load(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data.get("schema_version") == 1 and isinstance(data.get("gates"), list)
    seen = set()
    for gate in data["gates"]:
        assert gate["id"] not in seen
        assert gate["tier"] in ORDER and isinstance(gate["command"], list)
        if not gate.get("enabled", True):
            assert gate.get("disposition")
        seen.add(gate["id"])
    return data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", type=Path, default=Path("gates/gates.json"))
    parser.add_argument("--project-root", type=Path)
    parser.add_argument("--evidence-dir", type=Path)
    parser.add_argument("--tier", choices=tuple(ORDER), default="smoke")
    parser.add_argument("--gate", action="append", dest="gate_ids")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    registry_path = args.registry.resolve()
    root = (args.project_root or registry_path.parent.parent).resolve()
    evidence = (args.evidence_dir or root / "50-Evidence").resolve()
    registry = load(registry_path)
    wanted = set(args.gate_ids or [])
    gates = [g for g in registry["gates"] if g.get("enabled", True) and ((g["id"] in wanted) if wanted else ORDER[g["tier"]] <= ORDER[args.tier])]
    if args.gate_ids and wanted != {g["id"] for g in registry["gates"] if g["id"] in wanted}:
        raise SystemExit("unknown gate requested")
    if args.dry_run:
        for gate in gates:
            print(f"{gate['id']}: {' '.join(gate['command'])}")
        print(f"Selected {len(gates)} gates through tier {args.tier}")
        return 0
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:8]
    log_dir = evidence / "gate-logs" / run_id
    results = []
    for gate in gates:
        command = [sys.executable if part == "{python}" else part for part in gate["command"]]
        started = time.monotonic()
        try:
            proc = subprocess.run(command, cwd=root, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=float(gate.get("timeout_seconds", 60)), shell=False)
            observed = proc.returncode
            stdout, stderr, timed_out = proc.stdout, proc.stderr, False
        except subprocess.TimeoutExpired as exc:
            observed, stdout, stderr, timed_out = None, str(exc.stdout or ""), str(exc.stderr or ""), True
        passed = not timed_out and observed == gate.get("expected_exit_code", 0)
        log_dir.mkdir(parents=True, exist_ok=True)
        (log_dir / f"{gate['id']}.log").write_text("\n".join([f"command: {command}", f"expected: {gate.get('expected_exit_code', 0)}", f"observed: {observed}", "[stdout]", stdout, "[stderr]", stderr]), encoding="utf-8")
        result = {"id": gate["id"], "tier": gate["tier"], "required": gate.get("required", True), "status": "pass" if passed else "fail", "observed_exit_code": observed, "elapsed_ms": int((time.monotonic() - started) * 1000)}
        results.append(result)
        print(f"[{result['status'].upper()}] {gate['id']}")
    event = {"schema_version": 1, "type": "gate_run", "run_id": run_id, "observed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "registry_sha256": hashlib.sha256(registry_path.read_bytes()).hexdigest(), "tier": args.tier, "status": "fail" if any(r["required"] and r["status"] == "fail" for r in results) else "pass", "results": results}
    evidence.mkdir(parents=True, exist_ok=True)
    with (evidence / "events.jsonl").open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True, separators=(",", ":")) + "\n")
    print(f"Gate run {run_id}: {event['status']}")
    return 1 if event["status"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
