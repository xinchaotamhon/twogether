#!/usr/bin/env python3
"""Validate the inspected Empower A2 packet and Hiệp's scoped publication."""

import hashlib
import json
from pathlib import Path


def main() -> int:
    packet_path = Path("content/drafts/empower-a2-coursebook-final-review-v1.json")
    packet_bytes = packet_path.read_bytes()
    packet = json.loads(packet_bytes.decode("utf-8"))
    approval = json.loads(Path("content/reviews/empower-a2-knowledge-owner-approval-2026-09-04.json").read_text(encoding="utf-8"))
    cards = packet.get("cards", [])
    vocabulary = [card for card in cards if str(card.get("id", "")).startswith("coursebook-a2-vocab-")]
    knowledge = [card for card in cards if card not in vocabulary]
    errors: list[str] = []
    if packet.get("status") != "review" or packet.get("provenance", {}).get("review_status") != "ai_draft_owner_review_required":
        errors.append("packet must remain explicit AI draft in owner review")
    if packet.get("source", {}).get("pdf_pages") != 176 or len(packet.get("source", {}).get("sha256", "")) != 64:
        errors.append("source must retain the inspected 176-page PDF fingerprint")
    if len(cards) != 81 or len({card.get("id") for card in cards}) != 81:
        errors.append("packet must contain 81 unique cards")
    for card in cards:
        if card.get("status") != "review" or card.get("reviewer") is not None:
            errors.append(f"{card.get('id')}: immutable source packet was changed")
        if not card.get("source_pdf_pages") or not str(card.get("transfer_answer", "")).strip():
            errors.append(f"{card.get('id')}: missing page provenance or transfer answer")
        if not card.get("prerequisite_node_ids"):
            errors.append(f"{card.get('id')}: is not anchored to English Core")
    if approval.get("decided_by") != "hiep" or approval.get("decision") != "approved_for_published_study_by_scope":
        errors.append("scoped publication lacks Hiệp's explicit approval")
    if approval.get("source_sha256") != hashlib.sha256(packet_bytes).hexdigest():
        errors.append("approval does not fingerprint the immutable source packet")
    if len(knowledge) != 74 or approval.get("approved_scope", {}).get("expected_count") != 74:
        errors.append("approved non-vocabulary scope must contain exactly 74 cards")
    if len(vocabulary) != 7 or approval.get("retained_for_vocabulary_review", {}).get("expected_count") != 7:
        errors.append("vocabulary review scope must contain exactly 7 cards")

    corrections = json.loads(Path("content/revisions/empower-a2-transfer-corrections-v1.json").read_text(encoding="utf-8"))
    glossary = json.loads(Path("content/revisions/empower-a2-glossary-v1.json").read_text(encoding="utf-8"))
    declared_labels = {term.strip().lower() for card in cards for term in card.get("glossary_terms", [])}
    terms = glossary.get("terms", [])
    if len(terms) != 238 or {term.get("label", "").lower() for term in terms} != declared_labels:
        errors.append("glossary must cover exactly the 238 unique declared Empower terms without duplicates")
    for term in terms:
        if any(not str(term.get(field, "")).strip() for field in ["label", "meaning_vi", "explanation", "example", "why_it_matters"]):
            errors.append(f"{term.get('label')}: incomplete glossary scaffold")
    correction_records = corrections.get("overrides", [])
    if correction_records != [{
        "card_id": "coursebook-a2-course-05-01",
        "transfer_answer": "Go straight from the school gate, turn left at the office. The library is next to the science building.",
    }]:
        errors.append("Empower transfer correction must preserve the audited school-to-library answer")

    runtime = Path("src/empowerCurriculum.ts").read_text(encoding="utf-8")
    for literal in ["EMPOWER_KNOWLEDGE_CARDS", "EMPOWER_VOCABULARY_DRAFT_CARDS", "knowledgeSourceCards.length !== 74", "vocabularySourceCards.length !== 7"]:
        if literal not in runtime:
            errors.append(f"runtime scope guard lacks {literal!r}")
    panel = Path("src/CoursebookReviewPanel.tsx").read_text(encoding="utf-8")
    for literal in ["CHỈ DUYỆT TỪ MỚI", "Duyệt và đưa vào cây", "74 thẻ kiến thức khác đã vào cây"]:
        if literal not in panel:
            errors.append(f"review panel lacks {literal!r}")
    if errors:
        print(f"[FAIL] coursebook review contract: {len(errors)} error(s)")
        for error in errors[:20]:
            print(f" - {error}")
        return 1
    print("[PASS] 176 inspected pages -> 74 knowledge + 7 vocabulary-review cards + 238 glossary terms + audited transfer correction")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
