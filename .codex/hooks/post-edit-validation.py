#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path


FRONTEND_LINT_EXTENSIONS = {".ts", ".html"}


def load_payload():
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError:
        return {}


def normalize_path(path):
    repo_root = Path.cwd().resolve()
    candidate = Path(path)
    if candidate.is_absolute():
        try:
            return candidate.resolve().relative_to(repo_root).as_posix()
        except ValueError:
            return candidate.as_posix()
    return candidate.as_posix().lstrip("./")


def extract_paths(payload):
    tool_input = payload.get("tool_input") or {}
    paths = set()

    for key in ("file_path", "path"):
        value = tool_input.get(key)
        if isinstance(value, str):
            paths.add(value)

    command = tool_input.get("command")
    if isinstance(command, str):
        prefixes = (
            "*** Add File: ",
            "*** Update File: ",
            "*** Delete File: ",
            "*** Move to: ",
        )
        for line in command.splitlines():
            for prefix in prefixes:
                if line.startswith(prefix):
                    paths.add(line[len(prefix) :].strip())

    return {normalize_path(path) for path in paths if path}


def run_command(command, cwd):
    return subprocess.run(
        command,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def report_failure(title, command, result):
    output = result.stdout[-9000:] if result.stdout else "(no output)"
    context = f"{title} failed after an edit.\nCommand: {' '.join(command)}\n\n{output}"
    print(
        json.dumps(
            {
                "decision": "block",
                "reason": title,
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": context,
                },
            }
        )
    )


def main():
    repo_root = Path.cwd().resolve()
    paths = extract_paths(load_payload())
    if not paths:
        return 0

    frontend_files = sorted(
        path
        for path in paths
        if path.startswith("frontend/")
        and Path(path).suffix in FRONTEND_LINT_EXTENSIONS
    )
    backend_files = sorted(
        path for path in paths if path.startswith("backend/dailyboard-backend/")
    )

    if frontend_files:
        command = ["npm", "run", "lint", "--"]
        for path in frontend_files:
            command.extend(["--lint-file-patterns", path.removeprefix("frontend/")])
        result = run_command(command, repo_root / "frontend")
        if result.returncode != 0:
            report_failure("Frontend scoped lint", command, result)
            return 0

    if backend_files:
        command = ["./mvnw", "compile"]
        result = run_command(command, repo_root / "backend" / "dailyboard-backend")
        if result.returncode != 0:
            report_failure("Backend Maven compile", command, result)
            return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
