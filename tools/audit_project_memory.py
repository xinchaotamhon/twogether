#!/usr/bin/env python3
"""Audit project-memory routing without modifying files."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

LINK_RE = re.compile(r"\[[^\]]+\]\((?!https?://|#)([^)]+)\)")
VOLATILE_HINT_RE = re.compile(r"\b(current task|current version|active branch|next action|blocked by|test total)\b", re.IGNORECASE)
SECRET_ASSIGNMENT_RE = re.compile(r"(?i)(api[_-]?key|secret|password|token|cookie)\s*[:=]\s*['\"]?(?P<value>[A-Za-z0-9_./+=-]{12,})")
SAFE_SECRET_REFERENCE_RE = re.compile(r"(?i)^(process\.env\.|import\.meta\.env\.|deno\.env\.|os\.environ|config\.|settings\.)")


def contains_embedded_secret(text: str) -> bool:
    return any(not SAFE_SECRET_REFERENCE_RE.match(m.group("value")) for m in SECRET_ASSIGNMENT_RE.finditer(text))


def audit(root: Path) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {"errors": [], "warnings": [], "info": []}
    start = root / "START_HERE.md"
    if not start.exists():
        result["errors"].append("START_HERE.md is missing")
        return result
    text = start.read_text(encoding="utf-8")
    for raw_target in LINK_RE.findall(text):
        target = raw_target.strip().split("#", 1)[0]
        if target and not (start.parent / target).resolve().exists():
            result["errors"].append(f"Broken START_HERE link: {raw_target}")
    for line_no, line in enumerate(text.splitlines(), 1):
        if VOLATILE_HINT_RE.search(line) and "](" not in line:
            result["warnings"].append(f"Possible volatile fact in START_HERE.md:{line_no}: {line.strip()}")
    state_files = list(root.glob("**/CURRENT_STATE.md")) + list(root.glob("**/NEXT_ACTIONS.md"))
    if not state_files:
        result["warnings"].append("No CURRENT_STATE.md or NEXT_ACTIONS.md found")
    for path in state_files:
        if "last_verified:" not in path.read_text(encoding="utf-8"):
            result["warnings"].append(f"Volatile file lacks last_verified: {path.relative_to(root)}")
    scanned = 0
    for path in root.rglob("*.md"):
        if any(part in {".git", "node_modules", ".next"} for part in path.parts):
            continue
        scanned += 1
        if contains_embedded_secret(path.read_text(encoding="utf-8", errors="replace")):
            result["errors"].append(f"Possible embedded secret in {path.relative_to(root)}")
    result["info"].append(f"Scanned {scanned} Markdown files")
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_root", type=Path)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    result = audit(args.project_root.resolve())
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=True))
    else:
        for level in ("errors", "warnings", "info"):
            for message in result[level]:
                print(f"{level.upper()}: {message}")
    return 1 if result["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
