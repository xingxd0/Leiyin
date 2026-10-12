#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
CARDS_PATH = ROOT / "data" / "cards.json"
SOURCES_PATH = ROOT / "data" / "sources.json"
PUBLIC_PATH = ROOT / "public" / "knowledge.json"
SKILL_PATH = ROOT / "skills" / "current.md"
FAMILIAR_DAYS = 30

WRITE_LOCK = Lock()


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    temp_path = path.with_suffix(f"{path.suffix}.tmp")
    temp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp_path.replace(path)


def card_key(card: dict) -> str:
    return card.get("normalized_phrase") or card.get("id") or card.get("phrase") or ""


def find_card(cards: list[dict], key: str) -> dict | None:
    return next((card for card in cards if card_key(card) == key), None)


def build_public_payload(cards: list[dict], sources: list[dict]) -> dict:
    existing = read_json(PUBLIC_PATH) if PUBLIC_PATH.exists() else {}
    skill_content = SKILL_PATH.read_text(encoding="utf-8") if SKILL_PATH.exists() else ""
    skill = existing.get("skill") or {
        "path": str(SKILL_PATH.relative_to(ROOT)),
        "title": "Expression Extraction Skill v1",
        "content": skill_content,
    }
    skill["content"] = skill_content

    return {
        "generated_at": now_iso(),
        "summary": {
            "card_count": len(cards),
            "total_occurrences": sum(int(card.get("total_count") or 0) for card in cards),
            "source_count": len(sources),
            "mastered_count": sum(1 for card in cards if str(card.get("proficiency", "")).startswith("4/")),
            "pending_frequency_count": sum(1 for card in cards if card.get("frequency_label") == "待核对"),
        },
        "skill": skill,
        "cards": cards,
        "sources": sources,
    }


def persist_cards(cards: list[dict]) -> None:
    sources = read_json(SOURCES_PATH) if SOURCES_PATH.exists() else []
    write_json(CARDS_PATH, cards)
    write_json(PUBLIC_PATH, build_public_payload(cards, sources))


class PhrasebookHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status: HTTPStatus, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length") or 0)
        if content_length <= 0:
            return {}
        return json.loads(self.rfile.read(content_length).decode("utf-8"))

    def do_GET(self) -> None:
        if urlparse(self.path).path == "/api/status":
            self.send_json(HTTPStatus.OK, {"ok": True, "data_path": str(CARDS_PATH)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/practice":
            self.handle_practice()
            return
        if path == "/api/familiar":
            self.handle_familiar()
            return
        self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Unknown API endpoint"})

    def handle_practice(self) -> None:
        try:
            payload = self.read_body_json()
            key = str(payload.get("card_key") or "")
            action = str(payload.get("action") or "")
            if action not in {"correct", "wrong"}:
                self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid practice action"})
                return

            with WRITE_LOCK:
                cards = read_json(CARDS_PATH)
                card = find_card(cards, key)
                if not card:
                    self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Card not found"})
                    return

                practice = card.setdefault("practice", {"correct": 0, "wrong": 0})
                practice["correct"] = int(practice.get("correct") or 0)
                practice["wrong"] = int(practice.get("wrong") or 0)
                practice[action] += 1
                practice["updated_at"] = now_iso()
                persist_cards(cards)

            self.send_json(HTTPStatus.OK, {"ok": True, "card": card})
        except Exception as error:
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": str(error)})

    def handle_familiar(self) -> None:
        try:
            payload = self.read_body_json()
            key = str(payload.get("card_key") or "")
            familiar = bool(payload.get("familiar"))

            with WRITE_LOCK:
                cards = read_json(CARDS_PATH)
                card = find_card(cards, key)
                if not card:
                    self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Card not found"})
                    return

                if familiar:
                    expires_at = datetime.now(timezone.utc) + timedelta(days=FAMILIAR_DAYS)
                    card["priority_override"] = {
                        "priority": "P4",
                        "expires_at": expires_at.replace(microsecond=0).isoformat(),
                        "reason": "familiar",
                        "updated_at": now_iso(),
                    }
                else:
                    card.pop("priority_override", None)
                persist_cards(cards)

            self.send_json(HTTPStatus.OK, {"ok": True, "card": card})
        except Exception as error:
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": str(error)})


def main() -> None:
    host = "127.0.0.1"
    port = int(os.environ.get("PORT", "8765"))
    server = ThreadingHTTPServer((host, port), PhrasebookHandler)
    print(f"Serving Phrasebook on http://{host}:{port}/")
    print(f"Writing progress to {CARDS_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
