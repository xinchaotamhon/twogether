#!/usr/bin/env python3
"""Validate the review-only English Generative Core v1 packet."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any

PACKET_PATH = Path("content/drafts/core-curriculum-drafts-v2.json")
V1_PATH = Path("content/drafts/core-curriculum-drafts-v1.json")
EXPECTED_TITLES = [
    "Meaning → Clause", "Verb Architecture", "Negation & Questions",
    "Time, Aspect & Modality", "Noun & Reference", "Expanding the Clause",
    "Information Flow", "Sound & Listening", "Lexicon as a Network",
    "Integration & Production",
]
EXPECTED_TYPES = [
    "core_recall", "mechanism", "mechanism", "contrast", "boundary",
    "application", "production", "production",
]
ALLOWED_TYPES = set(EXPECTED_TYPES)
CARD_FIELDS = {
    "id", "track", "node_id", "card_type", "prompt", "model_answer",
    "explanation", "misconception", "transfer_prompt",
    "prerequisite_node_ids", "source_refs", "status", "author", "reviewer",
}
NODE_FIELDS = {"id", "kind", "title", "purpose", "status", "source_refs"}
EDGE_FIELDS = {"from", "to", "type"}
ALLOWED_EDGE_TYPES = {"prerequisite", "part_of", "contrasts_with", "applies_to", "example_of"}
FORBIDDEN = [
    re.compile(r"12\s*(?:thì|tenses).{0,100}(?:tự ghép|tự sinh|tự động sinh|automatically generate|generate all)", re.I),
    re.compile(r"go\s*(?:→|->|=>)\s*goes\s*(?:là|is)\s*(?:bất quy tắc|irregular|lexical)", re.I),
    re.compile(r"(?:học|biết|learn|know).{0,40}800\s*[-–]\s*1000.{0,80}(?:hiểu|cover|understand).{0,20}80\s*%", re.I),
    re.compile(r"(?:não|brain).{0,120}(?:chậm|slow).{0,120}(?:tiếng Việt|Vietnamese|đơn âm)", re.I),
]


def normalized(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip()).casefold()


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def collection_ids(collection: dict[str, Any]) -> list[str]:
    raw = collection.get("card_ids", collection.get("cardIds", []))
    return raw if isinstance(raw, list) and all(isinstance(item, str) for item in raw) else []


def duplicate_field(cards: list[dict[str, Any]], field: str) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for card in cards:
        groups[normalized(card.get(field))].append(str(card.get("id")))
    return [ids for value, ids in groups.items() if value and len(ids) > 1]


def graph_errors(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    node_ids = {node.get("id") for node in nodes}
    indegree = Counter({node_id: 0 for node_id in node_ids})
    adjacency: dict[Any, set[Any]] = defaultdict(set)
    edge_keys: list[tuple[Any, Any, Any]] = []
    for index, edge in enumerate(edges):
        if not isinstance(edge, dict) or not EDGE_FIELDS.issubset(edge):
            errors.append(f"edge[{index}] is invalid or missing required fields")
            continue
        source, target, edge_type = edge["from"], edge["to"], edge["type"]
        edge_keys.append((source, target, edge_type))
        if source not in node_ids or target not in node_ids:
            errors.append(f"edge[{index}] references an unknown node: {source!r} -> {target!r}")
            continue
        if edge_type not in ALLOWED_EDGE_TYPES:
            errors.append(f"edge[{index}] has unsupported type {edge_type!r}")
        if target not in adjacency[source]:
            adjacency[source].add(target)
            indegree[target] += 1
    repeated = [key for key, count in Counter(edge_keys).items() if count > 1]
    if repeated:
        errors.append(f"duplicate graph edges: {repeated}")
    queue = deque(node_id for node_id, degree in indegree.items() if degree == 0)
    visited = 0
    while queue:
        current = queue.popleft()
        visited += 1
        for target in adjacency[current]:
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if visited != len(node_ids):
        errors.append("knowledge graph must be acyclic")
    return errors


def validate(packet: dict[str, Any], previous: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if packet.get("schema_version") != 2:
        errors.append("schema_version must be 2")
    if packet.get("status") != "draft":
        errors.append("packet must remain draft")
    cards = packet.get("cards", [])
    nodes = packet.get("nodes", [])
    edges = packet.get("edges", [])
    collections = packet.get("collections", [])
    if not all(isinstance(value, list) for value in (cards, nodes, edges, collections)):
        return errors + ["cards, nodes, edges, and collections must be arrays"]

    card_by_id: dict[str, dict[str, Any]] = {}
    for index, card in enumerate(cards):
        if not isinstance(card, dict):
            errors.append(f"card[{index}] must be an object")
            continue
        missing = CARD_FIELDS - set(card)
        if missing:
            errors.append(f"card[{index}] missing {sorted(missing)}")
        card_id = card.get("id")
        if card_id in card_by_id:
            errors.append(f"duplicate card id {card_id!r}")
        elif isinstance(card_id, str):
            card_by_id[card_id] = card
        for field in CARD_FIELDS - {"reviewer", "prerequisite_node_ids"}:
            value = card.get(field)
            if value is None or value == "" or value == []:
                errors.append(f"card {card_id!r} has empty {field}")
        if card.get("reviewer") is not None:
            errors.append(f"draft card {card_id!r} reviewer must be null")
        if card.get("status") != "draft":
            errors.append(f"card {card_id!r} must remain draft")
        if card.get("card_type") not in ALLOWED_TYPES:
            errors.append(f"card {card_id!r} has invalid card_type")
        if not isinstance(card.get("prerequisite_node_ids"), list):
            errors.append(f"card {card_id!r} prerequisites must be an array")
        if not isinstance(card.get("source_refs"), list):
            errors.append(f"card {card_id!r} source_refs must be an array")

    english = [card for card in cards if isinstance(card, dict) and card.get("track") == "english"]
    react = [card for card in cards if isinstance(card, dict) and card.get("track") == "react"]
    expected_ids = [f"core-en-{number:02d}" for number in range(1, 81)]
    if [card.get("id") for card in english] != expected_ids:
        errors.append("English card order/IDs must be core-en-01 through core-en-80 exactly")
    if len(english) != 80 or len(react) != 10 or len(cards) != 90:
        errors.append(f"expected 80 English + 10 React cards; got {len(english)} + {len(react)}")
    for card in english:
        refs = card.get("source_refs", [])
        if "claude-owner-paste:english-2026-08-25" not in refs:
            errors.append(f"English card {card.get('id')} lacks owner-capture provenance")
        if "core-synthesis:english-generative-core-v1" not in refs or "english-core-sources:v1" not in refs:
            errors.append(f"English card {card.get('id')} lacks project source synthesis")
    for field in ("prompt", "model_answer"):
        duplicates = duplicate_field(english, field)
        if duplicates:
            errors.append(f"duplicate normalized English {field}: {duplicates}")

    node_ids: set[Any] = set()
    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"node[{index}] must be an object")
            continue
        if not NODE_FIELDS.issubset(node):
            errors.append(f"node[{index}] missing required fields")
        if node.get("id") in node_ids:
            errors.append(f"duplicate node id {node.get('id')!r}")
        node_ids.add(node.get("id"))
        if node.get("status") != "draft":
            errors.append(f"node {node.get('id')!r} must remain draft")
    errors.extend(graph_errors(nodes, edges))
    for card in cards:
        if not isinstance(card, dict):
            continue
        if card.get("node_id") not in node_ids:
            errors.append(f"card {card.get('id')} references unknown node")
        for prerequisite in card.get("prerequisite_node_ids", []):
            if prerequisite not in node_ids:
                errors.append(f"card {card.get('id')} has unknown prerequisite {prerequisite}")

    if len(collections) != 10:
        errors.append(f"expected 10 English collections, got {len(collections)}")
    collected: list[str] = []
    for index, title in enumerate(EXPECTED_TITLES):
        if index >= len(collections) or not isinstance(collections[index], dict):
            continue
        collection = collections[index]
        ids = collection_ids(collection)
        if collection.get("title") != title:
            errors.append(f"collection[{index}] must be titled {title!r}")
        if collection.get("status") != "draft" or collection.get("track") != "english":
            errors.append(f"collection {title!r} must be an English draft")
        if len(ids) != 8 or len(set(ids)) != 8:
            errors.append(f"collection {title!r} must contain 8 unique cards")
        if [card_by_id.get(card_id, {}).get("card_type") for card_id in ids] != EXPECTED_TYPES:
            errors.append(f"collection {title!r} has the wrong card-family sequence")
        collected.extend(ids)
    if collected != expected_ids:
        errors.append("collections must cover core-en-01..80 once and in order")

    old_react_cards = [card for card in previous.get("cards", []) if card.get("track") == "react"]
    old_react_nodes = [node for node in previous.get("nodes", []) if str(node.get("id", "")).startswith("core-react")]
    old_react_edges = [edge for edge in previous.get("edges", []) if str(edge.get("from", "")).startswith("core-react") or str(edge.get("to", "")).startswith("core-react")]
    new_react_nodes = [node for node in nodes if str(node.get("id", "")).startswith("core-react")]
    new_react_edges = [edge for edge in edges if str(edge.get("from", "")).startswith("core-react") or str(edge.get("to", "")).startswith("core-react")]
    if react != old_react_cards:
        errors.append("the 10 React cards must remain byte-for-byte equivalent as JSON values to v1")
    if new_react_nodes != old_react_nodes or new_react_edges != old_react_edges:
        errors.append("React nodes and edges must remain unchanged from v1")

    text = " ".join(f"{card.get('model_answer', '')} {card.get('explanation', '')}" for card in english)
    for pattern in FORBIDDEN:
        match = pattern.search(text)
        if match:
            errors.append(f"forbidden oversimplification matched: {match.group(0)!r}")
    return errors


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    try:
        packet, previous = load(PACKET_PATH), load(V1_PATH)
    except (OSError, json.JSONDecodeError) as error:
        print(f"[FAIL] cannot load curriculum: {error}")
        return 1
    errors = validate(packet, previous)
    if errors:
        print(f"[FAIL] English Generative Core v1: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] English Generative Core v1: 80 English drafts, 10 unchanged React drafts, 10 review modules, provenance, uniqueness, and DAG invariants passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
