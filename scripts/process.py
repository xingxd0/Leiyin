#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INBOX_DIR = ROOT / "content" / "inbox"
PROCESSED_DIR = ROOT / "content" / "processed"
SKILL_PATH = ROOT / "skills" / "current.md"
CARDS_PATH = ROOT / "data" / "cards.json"
SOURCES_PATH = ROOT / "data" / "sources.json"
PUBLIC_PATH = ROOT / "public" / "knowledge.json"

KNOWN_EXPRESSIONS = {
    "one step at a time": {
        "phrase": "One step at a time",
        "meaning": "一步一步来",
        "kind": "phrase",
    },
    "keep you posted": {
        "phrase": "Keep you posted",
        "meaning": "随时向你同步进展",
        "kind": "phrase",
    },
    "priority": {
        "phrase": "Priority",
        "meaning": "优先事项",
        "kind": "word",
    },
    "sounds good": {
        "phrase": "Sounds good",
        "meaning": "听起来不错",
        "kind": "phrase",
    },
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_phrase(value: str) -> str:
    normalized = re.sub(r"\s+", " ", value.strip().lower())
    return re.sub(r"[.!?]+$", "", normalized)


def content_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def source_files() -> list[Path]:
    return sorted(
        path
        for path in INBOX_DIR.iterdir()
        if path.suffix.lower() in {".json", ".txt", ".md"} and path.is_file()
    )


def load_source(path: Path) -> dict:
    if path.suffix.lower() == ".json":
        source = json.loads(path.read_text(encoding="utf-8"))
    else:
        source = {
            "id": path.stem,
            "title": path.stem,
            "source_type": "text",
            "skill": str(SKILL_PATH.relative_to(ROOT)),
            "created_at": now_iso(),
            "status": "pending",
            "content": path.read_text(encoding="utf-8"),
        }
    source.setdefault("id", path.stem)
    source.setdefault("title", path.stem)
    source.setdefault("source_type", "text")
    source.setdefault("skill", str(SKILL_PATH.relative_to(ROOT)))
    source.setdefault("created_at", now_iso())
    source.setdefault("status", "pending")
    source["file"] = str(path.relative_to(ROOT))
    source["hash"] = content_hash(source.get("content", ""))
    return source


def sentence_for(text: str, expression: str) -> str:
    for sentence in re.split(r"(?<=[.!?])\s+", text.strip()):
        if expression in sentence.lower():
            return sentence.strip()
    return text.strip().splitlines()[0] if text.strip() else ""


def extract_candidates(source: dict) -> list[dict]:
    text = source.get("content", "")
    lowered = text.lower()
    candidates = []
    for key, meta in KNOWN_EXPRESSIONS.items():
        count = len(re.findall(rf"\b{re.escape(key)}\b", lowered))
        if count:
            candidates.append(
                {
                    **meta,
                    "normalized_phrase": normalize_phrase(meta["phrase"]),
                    "example": sentence_for(text, key),
                    "count": count,
                }
            )
    return candidates


def merge_cards(cards: list[dict], source: dict, candidates: list[dict]) -> list[dict]:
    indexed = {card["normalized_phrase"]: card for card in cards}
    timestamp = now_iso()

    for candidate in candidates:
        key = candidate["normalized_phrase"]
        if key not in indexed:
            indexed[key] = {
                "id": key.replace(" ", "-"),
                "phrase": candidate["phrase"],
                "normalized_phrase": key,
                "meaning": candidate["meaning"],
                "kind": candidate["kind"],
                "proficiency": "new",
                "total_count": 0,
                "first_seen_at": timestamp,
                "last_seen_at": timestamp,
                "occurrences": [],
                "notes": "",
            }

        card = indexed[key]
        card["total_count"] += candidate["count"]
        card["last_seen_at"] = timestamp
        card["occurrences"].append(
            {
                "source_id": source["id"],
                "source_title": source["title"],
                "skill": source["skill"],
                "example": candidate["example"],
                "count": candidate["count"],
                "created_at": timestamp,
            }
        )

    return sorted(indexed.values(), key=lambda item: (-item["total_count"], item["phrase"].lower()))


def export_public(cards: list[dict], sources: list[dict]) -> None:
    skill_text = SKILL_PATH.read_text(encoding="utf-8") if SKILL_PATH.exists() else ""
    payload = {
        "generated_at": now_iso(),
        "summary": {
            "card_count": len(cards),
            "total_occurrences": sum(card["total_count"] for card in cards),
            "source_count": len(sources),
            "mastered_count": sum(1 for card in cards if card.get("proficiency") == "mastered"),
        },
        "skill": {
            "path": str(SKILL_PATH.relative_to(ROOT)),
            "title": "Expression Extraction Skill v1",
            "content": skill_text,
        },
        "cards": cards,
        "sources": sources,
    }
    write_json(PUBLIC_PATH, payload)


def process() -> None:
    cards = load_json(CARDS_PATH, [])
    sources = load_json(SOURCES_PATH, [])
    seen_hashes = {source["hash"] for source in sources if "hash" in source}
    processed = 0

    for path in source_files():
        source = load_source(path)
        if source["hash"] in seen_hashes:
            continue
        candidates = extract_candidates(source)
        cards = merge_cards(cards, source, candidates)
        source["candidate_count"] = len(candidates)
        source["processed_at"] = now_iso()
        source["status"] = "processed"
        sources.append(source)
        seen_hashes.add(source["hash"])
        processed += 1

        archived = PROCESSED_DIR / path.name
        archived.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")

    write_json(CARDS_PATH, cards)
    write_json(SOURCES_PATH, sources)
    export_public(cards, sources)
    print(f"Processed {processed} source(s). Cards: {len(cards)}. Sources: {len(sources)}.")


if __name__ == "__main__":
    process()
