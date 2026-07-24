#!/usr/bin/env python3
"""
Seed deterministic fixture boards for the CI E2E run.

The Hermes adapter (hermes_adapter.py) serves live Kanban boards from
HERMES_HOME/kanban/boards/<slug>/{board.json,kanban.db}. In CI there is no
real board data, so this script copies the committed fixtures under
test/fixtures/boards into that location (default HERMES_HOME=/opt/data,
overridable) so the adapter has something real to serve.

No mocks: the dashboard under test reads straight from the adapter, exactly
as it would in production.
"""
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# Fixtures live at repo-root test/fixtures/boards (committed for CI).
REPO_ROOT = os.path.abspath(os.path.join(HERE, ".."))
FIXTURES = os.path.join(REPO_ROOT, "test", "fixtures", "boards")
HERMES_HOME = os.environ.get("HERMES_HOME", "/opt/data")
TARGET = os.path.join(HERMES_HOME, "kanban", "boards")


def main() -> int:
    if not os.path.isdir(FIXTURES):
        print(f"[seed] no fixtures dir at {FIXTURES}", file=sys.stderr)
        return 1
    os.makedirs(TARGET, exist_ok=True)
    seeded = 0
    for slug in sorted(os.listdir(FIXTURES)):
        src = os.path.join(FIXTURES, slug)
        if not os.path.isdir(src):
            continue
        dst = os.path.join(TARGET, slug)
        # Never clobber a real board in CI; the fixture names are prefixed
        # "e2e-" so they cannot collide with production boards.
        if os.path.exists(dst):
            print(f"[seed] skip {slug} (already present)")
            continue
        shutil.copytree(src, dst)
        seeded += 1
        print(f"[seed] + {slug}")
    print(f"[seed] done (seeded {seeded} board(s) into {TARGET})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
