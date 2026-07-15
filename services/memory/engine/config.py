"""
Meridian Memory Service — Configuration
"""
import os

# Database
DB_HOST = os.getenv("MEMORY_DB_HOST", "localhost")
DB_PORT = int(os.getenv("MEMORY_DB_PORT", "5432"))
DB_NAME = os.getenv("MEMORY_DB_NAME", "meridian_memory")
DB_USER = os.getenv("MEMORY_DB_USER", "postgres")
DB_PASS = os.getenv("MEMORY_DB_PASS", "")

def get_dsn():
    # Use Unix socket when connecting as postgres user (no password needed)
    if DB_USER == "postgres" and DB_HOST in ("localhost", "127.0.0.1"):
        return f"host=/var/run/postgresql dbname={DB_NAME} user={DB_USER}"
    if DB_PASS:
        return f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASS}"
    return f"host=/var/run/postgresql dbname={DB_NAME} user={DB_USER}"

# OpenAI Embeddings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "1536"))

# Server
SERVER_HOST = os.getenv("MEMORY_SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("MEMORY_SERVER_PORT", "8300"))
