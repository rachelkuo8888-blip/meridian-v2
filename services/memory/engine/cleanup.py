"""
TTL Cleanup Worker — Purges expired working & episodic memory
"""
from .db import execute, execute_one

def purge_expired() -> dict:
    """Call the PostgreSQL function to purge expired records."""
    rows = execute("SELECT * FROM memory_purge_expired()")
    result = {}
    for r in rows:
        result[r["deleted_table"]] = r["deleted_count"]
    return result

def get_expiry_counts() -> dict:
    """Get count of currently expired records (before purge)."""
    working = execute_one("""
        SELECT COUNT(*) AS count FROM memory_working WHERE expires_at < NOW()
    """)
    episodic = execute_one("""
        SELECT COUNT(*) AS count FROM memory_episodic WHERE expires_at < NOW()
    """)
    return {
        "memory_working": working["count"] if working else 0,
        "memory_episodic": episodic["count"] if episodic else 0,
    }
