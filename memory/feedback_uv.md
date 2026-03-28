---
name: Use uv instead of pip
description: User prefers uv for running Python scripts and installing packages
type: feedback
---

Always use `uv` instead of `pip` or `python3` for this project.

**Why:** The project uses uv as the Python package manager. `pip` is not available.

**How to apply:**
- Install packages: `uv pip install <package>`
- Run scripts: `uv run <script.py>`
- Never suggest `pip install` or `python3 script.py`
