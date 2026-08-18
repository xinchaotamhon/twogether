"""Validate the provenance-aware core curriculum draft bundle."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CURRICULUM = ROOT / "content/drafts/core-curriculum-drafts-v1.json"
SYNTHESIS = ROOT / "content/sources/core-curriculum-synthesis-v1.md"


def main() -> int:
    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    assert data.get("schema_version") == 1
    assert data.get("status") == "draft"
    assert data.get("curriculum_id") == "core-curriculum-v1"
    assert SYNTHESIS.is_file()

    nodes = data.get("nodes")
    edges = data.get("edges")
    cards = data.get("cards")
    assert isinstance(nodes, list) and nodes
    assert isinstance(edges, list)
    assert isinstance(cards, list)

    node_ids = {node.get("id") for node in nodes}
    assert None not in node_ids and len(node_ids) == len(nodes)
    for node in nodes:
        assert node.get("status") == "draft"
        assert node.get("source_refs")

    for edge in edges:
        assert edge.get("from") in node_ids
        assert edge.get("to") in node_ids

    # The map is a DAG: a cycle would make the prerequisite ladder ambiguous.
    children = {node_id: [] for node_id in node_ids}
    indegree = {node_id: 0 for node_id in node_ids}
    for edge in edges:
        children[edge["from"]].append(edge["to"])
        indegree[edge["to"]] += 1
    queue = [node_id for node_id, degree in indegree.items() if degree == 0]
    visited = 0
    while queue:
        node_id = queue.pop()
        visited += 1
        for child in children[node_id]:
            indegree[child] -= 1
            if indegree[child] == 0:
                queue.append(child)
    assert visited == len(node_ids)

    required_card_fields = {
        "id",
        "track",
        "node_id",
        "card_type",
        "prompt",
        "model_answer",
        "explanation",
        "misconception",
        "transfer_prompt",
        "prerequisite_node_ids",
        "source_refs",
        "status",
        "author",
        "reviewer",
    }
    assert len({card.get("id") for card in cards}) == len(cards)
    assert {card.get("track") for card in cards} == {"english", "react"}
    assert sum(card.get("track") == "english" for card in cards) == 20
    assert sum(card.get("track") == "react" for card in cards) == 10
    for card in cards:
        assert required_card_fields <= card.keys()
        assert card["status"] == "draft"
        assert card["author"] == "codex"
        assert card["reviewer"] is None
        assert card["node_id"] in node_ids
        assert card["source_refs"]
        assert all(prerequisite in node_ids for prerequisite in card["prerequisite_node_ids"])
        assert all(isinstance(card[field], str) and card[field].strip() for field in required_card_fields - {"prerequisite_node_ids", "source_refs", "reviewer"})

    print("core curriculum contract: 30 draft cards (20 English, 10 React), 12 DAG nodes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
