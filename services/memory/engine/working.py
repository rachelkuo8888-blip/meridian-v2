"""
Working Memory — Short-term session memory (TTL: 24h)
"""
import uuid
from datetime import datetime, timezone, timedelta
from .db import execute, execute_one

def store(session_id: str, role: str, content: str,
          agent_id: str = "default", metadata: dict = None) -> dict:
    """Store a working memory entry."""
    import json
    meta_str = json.dumps(metadata or {})
    row = execute_one("""
        INSERT INTO memory_working (id, session_id, agent_id, role, content, metadata)
        VALUES (%s, %s, %s, %s, %s, %s::jsonb)
        RETURNING id, session_id, role, created_at, expires_at
    """, (uuid.uuid4(), session_id, agent_id, role, content, meta_str))
    return dict(row) if row else {}

def get_session(session_id: str, limit: int = 50) -> list[dict]:
    """Get all messages for a session, newest first."""
    rows = execute("""
        SELECT id, session_id, agent_id, role, content, metadata, created_at
        FROM memory_working
        WHERE session_id = %s AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT %s
    """, (session_id, limit))
    return [dict(r) for r in rows]

def get_session_chronological(session_id: str, limit: int = 50) -> list[dict]:
    """Get session messages in chronological order (oldest first)."""
    rows = execute("""
        SELECT id, session_id, agent_id, role, content, metadata, created_at
        FROM memory_working
        WHERE session_id = %s AND expires_at > NOW()
        ORDER BY created_at ASC
        LIMIT %s
    """, (session_id, limit))
    return [dict(r) for r in rows]

def search_session(session_id: str, query: str, limit: int = 10) -> list[dict]:
    """Full-text search within a session."""
    rows = execute("""
        SELECT id, session_id, agent_id, role, content, metadata, created_at,
               ts_rank(search_vector, plainto_tsquery('english', %s)) AS rank
        FROM memory_working
        WHERE session_id = %s
          AND search_vector @@ plainto_tsquery('english', %s)
          AND expires_at > NOW()
        ORDER BY rank DESC
        LIMIT %s
    """, (query, session_id, query, limit))
    return [dict(r) for r in rows]

def clear_session(session_id: str) -> int:
    """Delete all working memory for a session."""
    row = execute_one("""
        WITH deleted AS (
            DELETE FROM memory_working WHERE session_id = %s
            RETURNING 1
        )
        SELECT COUNT(*) AS count FROM deleted
    """, (session_id,))
    return row["count"] if row else 0

def count_active_sessions(minutes: int = 30) -> int:
    """Count sessions active in the last N minutes."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    row = execute_one("""
        SELECT COUNT(DISTINCT session_id) AS count
        FROM memory_working
        WHERE created_at > %s
    """, (cutoff,))
    return row["count"] if row else 0
