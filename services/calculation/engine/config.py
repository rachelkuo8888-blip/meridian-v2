"""Calculation Engine configuration."""

import os

ENGINE_VERSION = "calc-v1.0"
DEFAULT_HOST = os.environ.get("ENGINE_HOST", "0.0.0.0")
DEFAULT_PORT = int(os.environ.get("ENGINE_PORT", "8080"))
