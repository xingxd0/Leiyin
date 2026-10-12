#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
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


def parse_increment(markdown: str) -> list[dict]:
    rows = []
    for line in markdown.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 4 or cells[0] in {"英文", "---"}:
            continue
        term, meaning, frequency, priority = cells[:4]
        if not frequency.isdigit():
            continue
        rows.append(
            {
                "phrase": term,
                "normalized_phrase": normalize_phrase(term),
                "meaning": meaning,
                "frequency": int(frequency),
                "priority": priority,
            }
        )
    return rows


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_summary(public_payload: dict, cards: list[dict], sources: list[dict]) -> None:
    public_payload["generated_at"] = now_iso()
    public_payload["summary"] = {
        "card_count": len(cards),
        "total_occurrences": sum(int(card.get("total_count") or 0) for card in cards),
        "source_count": len(sources),
        "mastered_count": sum(1 for card in cards if str(card.get("proficiency", "")).startswith("4/")),
        "pending_frequency_count": sum(1 for card in cards if card.get("frequency_label") == "待核对"),
    }
    if SKILL_PATH.exists():
        public_payload["skill"]["content"] = SKILL_PATH.read_text(encoding="utf-8")
    public_payload["cards"] = cards
    public_payload["sources"] = sources


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: import_increment.py <markdown-path>")

    increment_path = (ROOT / sys.argv[1]).resolve()
    source_rel = increment_path.relative_to(ROOT).as_posix()
    rows = parse_increment(increment_path.read_text(encoding="utf-8"))
    cards = load_json(CARDS_PATH)
    sources = load_json(SOURCES_PATH)
    public_payload = load_json(PUBLIC_PATH)
    source_id = increment_path.stem
    created_at = "2026-10-01T00:00:00-07:00"
    note = "用户提供的新批次词库；重复词条按频率累计增加。"

    by_normalized = {card["normalized_phrase"]: card for card in cards}
    added = 0
    merged = 0

    for row in rows:
        occurrence = {
            "source_id": source_id,
            "source_title": "UX English Wiki Increment",
            "skill": source_rel,
            "example": note,
            "count": row["frequency"],
            "frequency_label": str(row["frequency"]),
            "created_at": created_at,
        }

        existing = by_normalized.get(row["normalized_phrase"])
        if existing:
            existing["meaning"] = row["meaning"] or existing.get("meaning", "")
            existing["priority"] = row["priority"] or existing.get("priority", "")
            existing["total_count"] = int(existing.get("total_count") or 0) + row["frequency"]
            existing["frequency_label"] = str(existing["total_count"])
            existing["last_seen_at"] = created_at
            existing.setdefault("occurrences", []).append(occurrence)
            existing["notes"] = note
            merged += 1
            continue

        card = {
            "id": slugify(row["phrase"]),
            "phrase": row["phrase"],
            "normalized_phrase": row["normalized_phrase"],
            "meaning": row["meaning"],
            "kind": kind_for(row["phrase"]),
            "priority": row["priority"],
            "frequency_label": str(row["frequency"]),
            "total_count": row["frequency"],
            "proficiency": "0/未测试",
            "first_seen_at": created_at,
            "last_seen_at": created_at,
            "occurrences": [occurrence],
            "notes": note,
        }
        cards.append(card)
        by_normalized[card["normalized_phrase"]] = card
        added += 1

    sources.append(
        {
            "id": source_id,
            "title": "UX English Wiki Increment",
            "source_type": "wiki_increment",
            "skill": source_rel,
            "created_at": created_at,
            "processed_at": now_iso(),
            "status": "processed",
            "file": source_rel,
            "card_count": len(rows),
            "notes": note,
        }
    )

    cards.sort(key=lambda card: (card.get("priority", "P9"), -(card.get("total_count") or 0), card["phrase"].lower()))
    update_summary(public_payload, cards, sources)
    write_json(CARDS_PATH, cards)
    write_json(SOURCES_PATH, sources)
    write_json(PUBLIC_PATH, public_payload)
    print(f"Imported {len(rows)} rows. Added {added}, merged {merged}.")


if __name__ == "__main__":
    main()
