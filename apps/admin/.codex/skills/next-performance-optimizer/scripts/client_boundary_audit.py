#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


EXCLUDED_DIRS = {".git", ".next", "node_modules", ".turbo"}


def is_excluded(file_path: Path, root: Path) -> bool:
    try:
        relative = file_path.relative_to(root)
    except ValueError:
        return False
    return any(part in EXCLUDED_DIRS for part in relative.parts)


def main() -> int:
    parser = argparse.ArgumentParser(description="List Next.js files that opt into client rendering.")
    parser.add_argument("root", nargs="?", default=".", help="Project root")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    matches = []

    for pattern in ("app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "components/**/*.ts"):
        for file_path in root.glob(pattern):
            if not file_path.is_file():
                continue
            if is_excluded(file_path, root):
                continue
            try:
                lines = file_path.read_text(encoding="utf-8").splitlines()
            except UnicodeDecodeError:
                continue
            first_code = next((line.strip() for line in lines if line.strip()), "")
            if first_code in {'"use client";', "'use client';", '"use client"', "'use client'"}:
                matches.append({"file": str(file_path), "first_code_line": first_code})

    print(json.dumps(sorted(matches, key=lambda item: item["file"]), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
