#!/usr/bin/env python3
"""Validate glossary + worked transfer answers and the active reveal boundary."""

from __future__ import annotations

import json
from pathlib import Path

EXPECTED_IDS = [f"core-en-{index:02d}" for index in range(1, 81)]
ALLOWED_TERMS = {
    "finite-verb", "non-finite-verb", "clause", "subject", "predicate", "object",
    "complement", "adjunct", "modifier", "tense", "aspect", "modality", "auxiliary",
    "lexical-verb", "determiner", "noun-phrase", "reference", "valency", "subordination",
    "relative-clause", "discourse", "collocation", "prosody", "phoneme", "morpheme",
}


def main() -> int:
    errors: list[str] = []
    support = json.loads(Path("content/drafts/english-core-support-v1.json").read_text(encoding="utf-8"))
    transfer = json.loads(Path("content/drafts/english-core-transfer-answers-v1.json").read_text(encoding="utf-8"))
    records = support.get("support_records", [])
    answers = transfer.get("answers", [])
    if [item.get("card_id") for item in records] != EXPECTED_IDS:
        errors.append("glossary support must cover the exact ordered 80 English Core IDs")
    if [item.get("card_id") for item in answers] != EXPECTED_IDS:
        errors.append("transfer answers must cover the exact ordered 80 English Core IDs")
    if transfer.get("provenance", {}).get("review_status") != "owner_requested_visible_draft":
        errors.append("transfer answers must retain visible AI-draft provenance")
    for record in records:
        refs = record.get("glossary_refs")
        if not isinstance(refs, list) or any(ref not in ALLOWED_TERMS for ref in refs):
            errors.append(f"{record.get('card_id')}: glossary refs are invalid")
    if any(not str(item.get("transfer_answer", "")).strip() for item in answers):
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
    print("[PASS] 80 worked transfer answers + glossary + attempt-before-reveal boundary")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
