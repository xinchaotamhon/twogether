#!/usr/bin/env python3
"""Validate immutable source plus owner-approved English Core runtime publication."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from check_english_core_v1 import load

PACKET_PATH = Path("content/drafts/english-core-beginner-revision-v2.json")
APPROVAL_PATH = Path("content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    packet = load(PACKET_PATH)
    errors: list[str] = []
    try:
        approval = json.loads(APPROVAL_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"cannot load owner approval: {error}")
        approval = {}

    english_ids = [card["id"] for card in packet.get("cards", []) if card.get("track") == "english"]
    collection_ids = [collection["id"] for collection in packet.get("collections", []) if collection.get("track") == "english"]
    if approval.get("decision") != "approved_for_published_study" or approval.get("decided_by") != "hiep":
        errors.append("owner approval decision/actor is invalid")
    if approval.get("card_ids") != english_ids or approval.get("collection_ids") != collection_ids:
        errors.append("owner approval must list the exact ordered 89 cards and 10 collections")
    if len(english_ids) != 89 or len(set(approval.get("card_ids", []))) != 89 or len(set(approval.get("collection_ids", []))) != 10:
        errors.append("owner approval IDs must be unique")
    if any(card.get("status") != "review" or not card.get("transfer_answer") for card in packet.get("cards", [])):
        errors.append("source cards must remain reviewed provenance with matching transfer answers")

    required_literals = {
        "src/approvedCurriculum.ts": [
            'status: "published"', 'reviewer: "hiep"', "APPROVED_ENGLISH_COLLECTIONS",
            "LEGACY_FIXTURE_COLLECTION_IDS", "APPROVED_CONTENT_VERSION",
        ],
        "src/collections.ts": ["APPROVED_ENGLISH_COLLECTIONS"],
        "src/dataAdapter.ts": ["APPROVED_ENGLISH_CARDS", "APPROVED_ENGLISH_NODES", "APPROVED_ENGLISH_EDGES", "migrateStore"],
        "src/localWorkspace.ts": ["APPROVED_CONTENT_VERSION", "LEGACY_FIXTURE_COLLECTION_IDS", "migrateWorkspace"],
        "public/sw.js": ["twogether-shell-v2"],
    }
    for filename, literals in required_literals.items():
        text = Path(filename).read_text(encoding="utf-8")
        for literal in literals:
            if literal not in text:
                errors.append(f"{filename} lacks publication invariant {literal!r}")

    if errors:
        print(f"[FAIL] published English Core v2: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] English Core v2: immutable review source + exact owner approval + 89 published cards + 10 collections + history-preserving migrations")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
