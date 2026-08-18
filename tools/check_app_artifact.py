#!/usr/bin/env python3
"""Small deterministic checks for the local P0 app and generated artifact."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    package = json.loads((root / "package.json").read_text(encoding="utf-8"))
    manifest = json.loads((root / "public/manifest.webmanifest").read_text(encoding="utf-8"))
    cards = json.loads((root / "content/cards.json").read_text(encoding="utf-8"))
    app = (root / "src/App.tsx").read_text(encoding="utf-8")
    styles = (root / "src/styles.css").read_text(encoding="utf-8")
    service_worker = (root / "public/sw.js").read_text(encoding="utf-8")

    assert package["dependencies"]["ts-fsrs"] == "5.4.1"
    assert manifest["display"] == "standalone"
    assert manifest["start_url"] == "/"
    assert (root / "public/sw.js").is_file()
    assert len(cards["cards"]) >= 12
    assert all(card["source_refs"] for card in cards["cards"] if card["status"] == "published")
    assert all("claude.ai/share" not in ref for card in cards["cards"] for ref in card["source_refs"])
    assert "Đã thử" in app and "Nhớ" in app and "Quên" in app
    assert "<table>" in app and "focus-visible" in styles and "prefers-reduced-motion" in styles
    assert "private_notes" not in service_worker and "review_events" not in service_worker

    forbidden = re.compile(r"(?i)(service[_-]?role|private[_-]?key|secret|authorization:\s*bearer|pushsubscription)")
    dist = root / "dist"
    if dist.exists():
        for path in dist.rglob("*"):
            if path.is_file():
                assert not forbidden.search(path.read_text(encoding="utf-8", errors="ignore")), path

    print("P0 artifact contract: pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
