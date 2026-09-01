#!/usr/bin/env python3
"""Validate the visually inspected Empower A2 long-term review packet."""

import json
from pathlib import Path


def main() -> int:
    packet = json.loads(Path("content/drafts/empower-a2-coursebook-final-review-v1.json").read_text(encoding="utf-8"))
    cards = packet.get("cards", [])
    errors: list[str] = []
    if packet.get("status") != "review" or packet.get("provenance", {}).get("review_status") != "ai_draft_owner_review_required":
        errors.append("packet must remain explicit AI draft in owner review")
    if packet.get("source", {}).get("pdf_pages") != 176 or len(packet.get("source", {}).get("sha256", "")) != 64:
        errors.append("source must retain the inspected 176-page PDF fingerprint")
    if len(cards) != 81 or len({card.get("id") for card in cards}) != 81:
        errors.append("packet must contain 81 unique cards")
    for card in cards:
        if card.get("status") != "review" or card.get("reviewer") is not None:
            errors.append(f"{card.get('id')}: was silently approved")
        if not card.get("source_pdf_pages") or not str(card.get("transfer_answer", "")).strip():
            errors.append(f"{card.get('id')}: missing page provenance or transfer answer")
        if not card.get("prerequisite_node_ids"):
            errors.append(f"{card.get('id')}: is not anchored to English Core")
    panel = Path("src/CoursebookReviewPanel.tsx").read_text(encoding="utf-8")
    for literal in ["Đánh dấu cần bỏ/sửa", "Gộp {eligible.length} thẻ đạt yêu cầu", "Học bền vững"]:
        if literal not in panel:
            errors.append(f"review panel lacks {literal!r}")
    if errors:
        print(f"[FAIL] coursebook review contract: {len(errors)} error(s)")
        for error in errors[:20]:
            print(f" - {error}")
        return 1
    print("[PASS] 176 inspected pages -> 81 review-only, English-Core-anchored long-term cards")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
