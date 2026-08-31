#!/usr/bin/env python3
"""Validate the review-only English Core support packet and runtime boundary."""

from __future__ import annotations

import json
import sys
from pathlib import Path


PACKET = Path("content/drafts/english-core-support-v1.json")
EXPECTED_IDS = [f"core-en-{index:02d}" for index in range(1, 81)]
ALLOWED_TERMS = {
    "finite-verb", "non-finite-verb", "clause", "subject", "predicate",
    "object", "complement", "adjunct", "modifier", "tense", "aspect",
    "modality", "auxiliary", "lexical-verb", "determiner", "noun-phrase",
    "reference", "valency", "subordination", "relative-clause", "discourse",
    "collocation", "prosody", "phoneme", "morpheme",
}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    errors: list[str] = []
    try:
        packet = json.loads(PACKET.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"[FAIL] cannot load support packet: {error}")
        return 1

    records = packet.get("support_records", [])
    ids = [record.get("card_id") for record in records]
    if packet.get("schema_version") != 1 or packet.get("status") != "draft":
        errors.append("packet must remain schema v1 draft")
    if packet.get("provenance", {}).get("review_status") != "ai_draft_unreviewed":
        errors.append("AI support must remain explicitly unreviewed")
    if ids != EXPECTED_IDS or len(set(ids)) != 80:
        errors.append("support records must list the exact ordered 80 English Core IDs")
    for record in records:
        card_id = record.get("card_id", "<unknown>")
        if not str(record.get("scaffold_prompt", "")).strip() or not str(record.get("scaffold_answer", "")).strip():
            errors.append(f"{card_id}: scaffold prompt/answer must both be non-empty")
        refs = record.get("glossary_refs")
        if not isinstance(refs, list) or any(ref not in ALLOWED_TERMS for ref in refs):
            errors.append(f"{card_id}: glossary refs are invalid")

    required_literals = {
        "src/App.tsx": ["twogether.english-support-v1-enabled", "Dùng thử lớp hỗ trợ"],
        "src/StudyView.tsx": ["Chưa hiểu câu hỏi?", "Xem lời giải câu phụ", "Đã thử — xem đáp án"],
        "src/glossary.ts": ['id: "finite-verb"', 'id: "non-finite-verb"'],
        "src/cardSupport.ts": ["ai_draft_unreviewed", "supportForCard"],
    }
    for filename, literals in required_literals.items():
        source = Path(filename).read_text(encoding="utf-8")
        for literal in literals:
            if literal not in source:
                errors.append(f"{filename} lacks support invariant {literal!r}")

    if errors:
        print(f"[FAIL] English support contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] 80 AI-draft support records + resolvable glossary + opt-in attempt-before-reveal boundary")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
