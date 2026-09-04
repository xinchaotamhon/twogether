#!/usr/bin/env python3
"""Lock the reversible session-study mode requested on 2026-09-04."""

from pathlib import Path


def main() -> int:
    errors: list[str] = []
    app = Path("src/App.tsx").read_text(encoding="utf-8")
    study = Path("src/StudyView.tsx").read_text(encoding="utf-8")
    styles = Path("src/styles.support.css").read_text(encoding="utf-8")
    env = Path(".env.example").read_text(encoding="utf-8")

    required = {
        "App": [
            'VITE_STUDY_MODE ?? "session"',
            "twogether.session.forgotten.",
            "SESSION_ONLY_MODE",
        ],
        "StudyView": [
            "Đã thử — lật thẻ",
            "Xáo ↝",
            'type="range"',
            "Tình huống mới",
            "GlossaryText",
            "Ôn lại ${forgottenCount} câu Quên",
        ],
        "styles": [
            ".map-study-overlay",
            "backdrop-filter: blur",
            ".study-flip-card.is-revealed",
            "overflow: hidden",
        ],
        "env": ["VITE_STUDY_MODE=session"],
    }
    for label, (text, literals) in {
        "App": (app, required["App"]),
        "StudyView": (study, required["StudyView"]),
        "styles": (styles, required["styles"]),
        "env": (env, required["env"]),
    }.items():
        for literal in literals:
            if literal not in text:
                errors.append(f"{label} lacks {literal!r}")
    for removed in ["DỄ NHẦM", "Dễ nhầm"]:
        if removed in study:
            errors.append(f"StudyView still exposes removed block {removed!r}")

    if errors:
        print(f"[FAIL] session study contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] session-only flip study, free navigation, shuffle, glossary and non-scrolling focus shell")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
