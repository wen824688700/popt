import os
import sys

# Make `backend/app` importable as top-level `app` (the existing backend code uses `from app...`).
_ROOT = os.path.dirname(os.path.dirname(__file__))
_BACKEND_DIR = os.path.join(_ROOT, "backend")
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from app.main import app  # noqa: E402

