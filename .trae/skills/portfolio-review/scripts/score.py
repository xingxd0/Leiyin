#!/usr/bin/env python3
"""Validate and calculate a private review record. Does not assess portfolios."""

import argparse
import json
import math
import sys
from pathlib import Path


CONFIG = Path(__file__).resolve().parent.parent / "references" / "scoring-config.json"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def numeric(value):
    return type(value) in (int, float) and math.isfinite(value)


def validate_weights(weights, dimensions):
    require(isinstance(weights, dict) and set(weights) == set(dimensions),
            "weights must contain exactly the six dimensions")
    require(all(numeric(v) and v > 0 for v in weights.values()),
            "each dimension must have a finite positive weight")
    require(math.isclose(sum(weights.values()), 100, abs_tol=1e-8, rel_tol=0),
            "weights must sum to 100")


def score_section(section, weights, dimensions):
    require(isinstance(section, dict), "assessment section must be an object")
    ratings = section.get("ratings")
    evidence = section.get("evidence")
    require(isinstance(ratings, dict) and set(ratings) == set(dimensions),
            "ratings must contain exactly the six dimensions")
    require(isinstance(evidence, dict) and set(evidence) == set(dimensions),
            "evidence must contain exactly the six dimensions")
    require(all(nonempty(v) for v in evidence.values()),
            "every dimension needs an evidence note or a missing-evidence reason")
    require(all(v is None or (type(v) is int and 1 <= v <= 5)
                for v in ratings.values()), "ratings must be integers 1–5 or null")
    validate_weights(weights, dimensions)
    missing = [key for key in dimensions if ratings[key] is None]
    total = None if missing else round(sum(weights[k] * ratings[k] / 5
                                           for k in dimensions), 1)
    return {"total": total, "out_of": 100, "ratings": ratings,
            "weights": weights, "unassessed_dimensions": missing}


def evaluate(record, config):
    require(isinstance(record, dict), "record must be an object")
    require(record.get("profile_confirmed") is True,
            "explicit profile confirmation is required before scoring")
    require(record.get("rubric_version") == config["version"],
            "record rubric_version must match the current scoring config")
    profile = record.get("profile")
    require(isinstance(profile, dict), "profile must be an object")
    orientation = profile.get("primary_orientation")
    require(isinstance(orientation, str) and orientation in config["weights"],
            "unknown primary_orientation")
    require(profile.get("general_level") in ("L1", "L2", "L3", "L4", "L5"),
            "a confirmed general review level is required")
    require(nonempty(record.get("scope")), "confirmed reading scope is required")
    dimensions = config["dimensions"]
    general = score_section(record.get("general"), config["weights"][orientation], dimensions)
    result = {"private": True, "rubric_version": config["version"],
              "general": general, "job_match": None}
    jd = record.get("jd")
    if jd is not None:
        require(isinstance(jd, dict), "jd must be an object or null")
        require(nonempty(jd.get("source")), "JD source is required")
        require(jd.get("target_level") in ("L1", "L2", "L3", "L4", "L5"),
                "JD target level is required")
        require(nonempty(jd.get("weight_basis")), "JD weight rationale is required")
        requirements = jd.get("requirements")
        require(isinstance(requirements, list) and len(requirements) > 0,
                "at least one JD requirement must be assessed")
        for item in requirements:
            require(isinstance(item, dict), "JD requirement must be an object")
            require(item.get("type") in ("core", "required", "bonus"),
                    "invalid JD requirement type")
            require(item.get("status") in ("supported", "partial", "insufficient", "conflict"),
                    "invalid JD evidence status")
            require(nonempty(item.get("requirement")) and nonempty(item.get("evidence")),
                    "JD requirement and evidence notes are required")
        result["job_match"] = score_section(jd, jd.get("weights"), dimensions)
        result["job_match"]["required_items_needing_attention"] = [
            item for item in requirements
            if item["type"] == "required" and item["status"] != "supported"
        ]
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("record", type=Path, help="private JSON assessment record")
    args = parser.parse_args()
    try:
        config = json.loads(CONFIG.read_text(encoding="utf-8"))
        record = json.loads(args.record.read_text(encoding="utf-8"))
        result = evaluate(record, config)
    except (ValueError, OSError) as exc:
        print(f"Cannot score: {exc}", file=sys.stderr)
        return 2
    # This output contains internal weights. It is not the candidate report.
    print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
