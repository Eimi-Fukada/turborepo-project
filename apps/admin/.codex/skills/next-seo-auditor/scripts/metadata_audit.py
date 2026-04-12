#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re


ROUTE_FILES = {"page.tsx", "page.ts", "layout.tsx", "layout.ts"}
PRIVATE_SEGMENTS = {"login", "admin", "dashboard", "account", "settings", "userInfo"}


def route_from_file(app_dir: Path, file_path: Path) -> str:
    relative = file_path.relative_to(app_dir)
    parts = [part for part in relative.parts[:-1] if not part.startswith("(")]
    route = "/" + "/".join(parts)
    return route if route != "/" else "/"


def classify_route(route: str) -> str:
    parts = {part for part in route.split("/") if part}
    return "private" if parts & PRIVATE_SEGMENTS else "public"


def inspect_file(file_path: Path) -> dict[str, object]:
    text = file_path.read_text(encoding="utf-8")
    has_metadata = bool(re.search(r"\bexport\s+const\s+metadata\b", text))
    has_generate_metadata = bool(re.search(r"\bexport\s+async?\s*function\s+generateMetadata\b", text))
    has_robots = "robots:" in text
    has_open_graph = "openGraph:" in text
    return {
        "file": str(file_path),
        "has_metadata": has_metadata,
        "has_generate_metadata": has_generate_metadata,
        "has_robots": has_robots,
        "has_open_graph": has_open_graph,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Next.js App Router metadata coverage.")
    parser.add_argument("app_dir", nargs="?", default="app", help="Path to the app directory")
    args = parser.parse_args()

    app_dir = Path(args.app_dir).resolve()
    results: list[dict[str, object]] = []

    for file_path in sorted(app_dir.rglob("*")):
        if not file_path.is_file() or file_path.name not in ROUTE_FILES:
            continue
        route = route_from_file(app_dir, file_path)
        report = inspect_file(file_path)
        report["route"] = route
        report["route_type"] = classify_route(route)
        report["needs_attention"] = not (report["has_metadata"] or report["has_generate_metadata"])
        results.append(report)

    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
