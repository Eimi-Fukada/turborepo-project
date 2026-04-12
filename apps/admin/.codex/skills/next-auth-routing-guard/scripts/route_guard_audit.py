#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re


WHITELIST_RE = re.compile(r"whiteList\s*=\s*\[([^\]]*)\]", re.DOTALL)
STRING_RE = re.compile(r'["\']([^"\']+)["\']')


def app_routes(app_dir: Path) -> list[str]:
    routes = []
    for page_file in sorted(app_dir.rglob("page.tsx")):
        parts = [part for part in page_file.relative_to(app_dir).parts[:-1] if not part.startswith("(")]
        route = "/" + "/".join(parts)
        routes.append(route if route != "/" else "/")
    return routes


def whitelist_routes(middleware_path: Path) -> list[str]:
    if not middleware_path.exists():
        return []
    text = middleware_path.read_text(encoding="utf-8", errors="ignore")
    match = WHITELIST_RE.search(text)
    if not match:
        return []
    return STRING_RE.findall(match.group(1))


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Next.js route files against middleware whitelist patterns.")
    parser.add_argument("--app-dir", default="app")
    parser.add_argument("--middleware", default="middleware.ts")
    args = parser.parse_args()

    app_dir = Path(args.app_dir).resolve()
    middleware_path = Path(args.middleware).resolve()
    routes = app_routes(app_dir)
    whitelist = whitelist_routes(middleware_path)

    report = {
        "routes": routes,
        "whitelist": whitelist,
        "public_routes_present_in_app": [route for route in routes if route in whitelist],
        "routes_needing_manual_guard_review": [route for route in routes if route not in whitelist],
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
