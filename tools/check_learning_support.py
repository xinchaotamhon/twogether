#!/usr/bin/env python3
"""Validate glossary + worked transfer answers and the active reveal boundary."""

from __future__ import annotations

import json
from pathlib import Path

EXPECTED_IDS = [f"core-en-{index:02d}" for index in range(1, 81)] + [f"core-en-bridge-{index:02d}" for index in range(2, 11)]
ALLOWED_TERMS = {
    "finite-verb", "non-finite-verb", "clause", "subject", "predicate", "object",
    "complement", "adjunct", "modifier", "tense", "aspect", "modality", "auxiliary",
    "lexical-verb", "determiner", "noun-phrase", "reference", "valency", "subordination",
    "relative-clause", "discourse", "collocation", "prosody", "phoneme", "morpheme",
}


def main() -> int:
    errors: list[str] = []
    packet = json.loads(Path("content/drafts/english-core-beginner-revision-v2.json").read_text(encoding="utf-8"))
    cards = packet.get("cards", [])
    if [item.get("id") for item in cards] != EXPECTED_IDS:
        errors.append("support must cover the exact ordered 89 English Core v2 IDs")
    if packet.get("provenance", {}).get("review_status") != "awaiting_owner_second_review":
        errors.append("source packet must retain its original review provenance")
    for record in cards:
        refs = record.get("glossary_refs")
        if not isinstance(refs, list) or any(ref not in ALLOWED_TERMS for ref in refs):
            errors.append(f"{record.get('id')}: glossary refs are invalid")
    if any(not str(item.get("transfer_answer", "")).strip() for item in cards):
        errors.append("every transfer answer must be non-empty")

    study = Path("src/StudyView.tsx").read_text(encoding="utf-8")
    for literal in ["Đã thử — xem đáp án", "Xem lời giải gợi ý", 'data-testid="transfer-answer"', "GlossaryHelp"]:
        if literal not in study:
            errors.append(f"StudyView lacks {literal!r}")
    for removed in ["Chưa hiểu câu hỏi?", "Xem lời giải câu phụ"]:
        if removed in study:
            errors.append(f"active StudyView still renders removed secondary-question control {removed!r}")

    if errors:
        print(f"[FAIL] learning support contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] 89 worked transfer answers + glossary + attempt-before-reveal boundary")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
