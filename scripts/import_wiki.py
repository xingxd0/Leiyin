#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIKI_PATH = ROOT / "content" / "wiki" / "ux-english-wiki.md"
CARDS_PATH = ROOT / "data" / "cards.json"
SOURCES_PATH = ROOT / "data" / "sources.json"
PUBLIC_PATH = ROOT / "public" / "knowledge.json"
SKILL_PATH = ROOT / "skills" / "current.md"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "entry"


def normalize_phrase(value: str) -> str:
    normalized = re.sub(r"\s+", " ", value.strip().lower())
    return re.sub(r"[.!?]+$", "", normalized)


def kind_for(term: str) -> str:
    return "phrase" if " " in term.strip() else "word"


def parse_table(markdown: str) -> list[dict]:
    rows = []
    in_vocab = False
    for line in markdown.splitlines():
        if line.strip() == "## Vocabulary":
            in_vocab = True
            continue
        if not in_vocab or not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if not cells or cells[0] in {"Term", "---"}:
            continue
        if len(cells) < 6:
            continue
        term, meaning, priority, frequency, proficiency, notes = cells[:6]
        frequency_value = int(frequency) if frequency.isdigit() else 0
        rows.append(
            {
                "id": slugify(term),
                "phrase": term,
                "normalized_phrase": normalize_phrase(term),
                "meaning": meaning,
                "kind": kind_for(term),
                "priority": priority,
                "frequency_label": frequency,
                "total_count": frequency_value,
                "proficiency": proficiency,
                "first_seen_at": "2026-10-01T00:00:00-07:00",
                "last_seen_at": "2026-10-01T00:00:00-07:00",
                "occurrences": [
                    {
                        "source_id": "ux-english-wiki-2026-10-01",
                        "source_title": "UX English Wiki",
                        "skill": "content/wiki/ux-english-wiki.md",
                        "example": notes,
                        "count": frequency_value,
                        "frequency_label": frequency,
                        "created_at": "2026-10-01T00:00:00-07:00",
                    }
                ],
                "notes": notes,
            }
        )
    return rows


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    markdown = WIKI_PATH.read_text(encoding="utf-8")
    cards = parse_table(markdown)
    sources = [
        {
            "id": "ux-english-wiki-2026-10-01",
            "title": "UX English Wiki",
            "source_type": "wiki",
            "skill": "content/wiki/ux-english-wiki.md",
            "created_at": "2026-10-01T00:00:00-07:00",
            "processed_at": now_iso(),
            "status": "processed",
            "file": str(WIKI_PATH.relative_to(ROOT)),
            "card_count": len(cards),
            "notes": "Imported from user-provided UX English Wiki. Frequency 待核对 is preserved as a label, not counted as zero.",
        }
    ]
    confirmed_total = sum(card["total_count"] for card in cards)
    pending_count = sum(1 for card in cards if card["frequency_label"] == "待核对")
    skill_text = SKILL_PATH.read_text(encoding="utf-8") if SKILL_PATH.exists() else ""

    public_payload = {
        "generated_at": now_iso(),
        "summary": {
            "card_count": len(cards),
            "total_occurrences": confirmed_total,
            "source_count": len(sources),
            "mastered_count": sum(1 for card in cards if card["proficiency"].startswith("4/")),
            "pending_frequency_count": pending_count,
        },
        "skill": {
            "path": str(SKILL_PATH.relative_to(ROOT)),
            "title": "Expression Extraction Skill v1",
            "content": skill_text,
        },
        "cards": cards,
        "sources": sources,
    }

    write_json(CARDS_PATH, cards)
    write_json(SOURCES_PATH, sources)
    write_json(PUBLIC_PATH, public_payload)
    print(f"Imported {len(cards)} cards. Confirmed total frequency: {confirmed_total}. Pending frequency: {pending_count}.")


if __name__ == "__main__":
    main()
