#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re


ENV_REF_RE = re.compile(r"process\.env\.([A-Z0-9_]+)")
EXCLUDED_DIRS = {".git", ".next", "node_modules", ".turbo"}


def is_excluded(file_path: Path, root: Path) -> bool:
    try:
        relative = file_path.relative_to(root)
    except ValueError:
        return False
    return any(part in EXCLUDED_DIRS for part in relative.parts)


def parse_env_file(file_path: Path) -> set[str]:
    keys = set()
    for line in file_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        keys.add(stripped.split("=", 1)[0].strip())
    return keys


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit env files and env var references in a Next.js project.")
    parser.add_argument("root", nargs="?", default=".", help="Project root")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    env_files = sorted(root.glob(".env*"))
    env_map = {file_path.name: sorted(parse_env_file(file_path)) for file_path in env_files if file_path.is_file()}

    referenced = set()
    for file_path in root.rglob("*"):
        if not file_path.is_file() or file_path.suffix not in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
            continue
        if is_excluded(file_path, root):
            continue
        referenced.update(ENV_REF_RE.findall(file_path.read_text(encoding="utf-8", errors="ignore")))

    print(json.dumps({"env_files": env_map, "referenced_in_code": sorted(referenced)}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
