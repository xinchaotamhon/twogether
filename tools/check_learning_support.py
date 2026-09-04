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
EXPECTED_TRANSFER_REVISION_IDS = {
    "core-en-03", "core-en-05", "core-en-25", "core-en-26", "core-en-39",
    "core-en-40", "core-en-46", "core-en-47", "core-en-48", "core-en-49",
    "core-en-50", "core-en-51", "core-en-52", "core-en-54", "core-en-56",
    "core-en-57", "core-en-58", "core-en-59", "core-en-60", "core-en-61",
    "core-en-62", "core-en-65", "core-en-67", "core-en-69", "core-en-70",
    "core-en-73", "core-en-74", "core-en-75", "core-en-76", "core-en-78",
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
    for literal in ["Đã thử — lật thẻ", "Tình huống mới", 'data-testid="transfer-answer"', "GlossaryText"]:
        if literal not in study:
            errors.append(f"StudyView lacks {literal!r}")
    for removed in ["Chưa hiểu câu hỏi?", "Xem lời giải câu phụ"]:
        if removed in study:
            errors.append(f"active StudyView still renders removed secondary-question control {removed!r}")
    app = Path("src/App.tsx").read_text(encoding="utf-8")
    if "supportForCard(rawCurrentCard.id)" in app:
        errors.append("study must not overwrite current v2 or Human-edited answers with legacy support")
    approved = Path("src/approvedCurriculum.ts").read_text(encoding="utf-8")
    if "transferOverrides.get(card.id)" not in approved:
        errors.append("paired transfer revisions must be applied at the base-card boundary")

    if errors:
        print(f"[FAIL] learning support contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    revisions = json.loads(Path("content/revisions/english-core-transfer-novelty-v3.json").read_text(encoding="utf-8"))
    revision_ids = {record.get("card_id") for record in revisions.get("overrides", [])}
    if revision_ids != EXPECTED_TRANSFER_REVISION_IDS or len(revisions.get("overrides", [])) != len(EXPECTED_TRANSFER_REVISION_IDS):
        errors.append("transfer novelty revision must contain the exact 30 audited scenarios")
    for record in revisions.get("overrides", []):
        if not str(record.get("transfer_prompt", "")).strip() or not str(record.get("transfer_answer", "")).strip():
            errors.append(f"{record.get('card_id')}: revised transfer prompt/answer must stay paired")

    if errors:
        print(f"[FAIL] learning support contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] 89 worked transfer answers + inline glossary + 30 novel transfer revisions + reveal boundary")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
