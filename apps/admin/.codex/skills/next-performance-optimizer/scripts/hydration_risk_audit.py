#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re


EXCLUDED_DIRS = {".git", ".next", "node_modules", ".turbo"}

PATTERNS = {
    "window_api": re.compile(r"\bwindow\b"),
    "document_api": re.compile(r"\bdocument\b"),
    "storage_api": re.compile(r"\blocalStorage\b|\bsessionStorage\b"),
    "random_value": re.compile(r"\bMath\.random\("),
    "time_now": re.compile(r"\bDate\.now\("),
    "new_date": re.compile(r"\bnew\s+Date\("),
}


def is_excluded(file_path: Path, root: Path) -> bool:
    try:
        relative = file_path.relative_to(root)
    except ValueError:
        return False
    return any(part in EXCLUDED_DIRS for part in relative.parts)


def main() -> int:
    parser = argparse.ArgumentParser(description="Flag common hydration risks in a Next.js project.")
    parser.add_argument("root", nargs="?", default=".", help="Project root")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    findings = []

    for file_path in root.rglob("*"):
        if not file_path.is_file() or file_path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
            continue
        if is_excluded(file_path, root):
            continue
        text = file_path.read_text(encoding="utf-8", errors="ignore")
        matched = [label for label, pattern in PATTERNS.items() if pattern.search(text)]
        if matched:
            findings.append({"file": str(file_path), "risks": matched})

    print(json.dumps(findings, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
