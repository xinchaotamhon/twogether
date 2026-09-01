import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
packet = json.loads((root / "content/drafts/english-core-beginner-revision-v2.json").read_text(encoding="utf-8"))
source = json.loads((root / "content/drafts/core-curriculum-drafts-v2.json").read_text(encoding="utf-8"))
style = (root / "docs/CONTENT_STYLE_HIEP_HOANG.md").read_text(encoding="utf-8")
library = (root / "src/CardLibraryView.tsx").read_text(encoding="utf-8")

assert packet["status"] == "review"
assert packet["provenance"]["review_status"] == "awaiting_owner_second_review"
cards = packet["cards"]
assert len(cards) == 89
assert len({card["id"] for card in cards}) == 89
original_ids = {card["id"] for card in source["cards"] if card.get("track") == "english"}
revision_ids = {card["id"] for card in cards if card.get("revision_of")}
assert revision_ids == original_ids and len(original_ids) == 80
bridges = [card for card in cards if card.get("revision_reason") == "new_beginner_bridge"]
assert len(bridges) == 9
required_text = ["prompt", "model_answer", "explanation", "misconception", "transfer_prompt", "transfer_answer"]
assert all(all(card.get(field) for field in required_text) for card in cards)
assert all(isinstance(card.get("glossary_refs"), list) and card["glossary_refs"] for card in cards)
assert all(isinstance(card.get("prerequisite_node_ids"), list) for card in cards)
assert all(isinstance(card.get("source_refs"), list) and card["source_refs"] for card in cards)
assert all(card["node_id"] not in card["prerequisite_node_ids"] for card in cards)
assert all(collection["status"] == "review" for collection in packet["collections"])
assert sorted(len(collection["card_ids"]) for collection in packet["collections"]) == [8] + [9] * 9
assert "There is no fixed number of cards per collection" in style
assert "THỬ CHUYỂN SANG TÌNH HUỐNG MỚI" in library
assert "transfer-preview-answer" in library
print("Beginner Core v2 contract: 89 review cards, 9 bridges, no self-prerequisites, transfer routing paired.")
