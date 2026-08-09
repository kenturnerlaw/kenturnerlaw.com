from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCE_COMMIT = "f00e535e2fa31b70128aa4f2dd06ae1e0f9057dc"

# One-time safety repair: restore the complete homepage exactly as it existed
# immediately before the accidental preview-file replacement.
restored = subprocess.check_output(
    ["git", "show", f"{SOURCE_COMMIT}:index.html"],
    cwd=ROOT,
)
(ROOT / "index.html").write_bytes(restored)
print(f"Restored index.html exactly from {SOURCE_COMMIT}")
