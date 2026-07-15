"""
Episodic Memory — Mid-term task/event memory (TTL: 90d) with semantic search
"""
import uuid
from datetime import datetime, timezone, timedelta
from .db import execute, execute_one
from .embedding import embed

def store(episode_id: str | None, agent_id: str, episode_type: str,
          title: str, content: str, summary: str = None,
          tags: list[str] = None, metadata: dict = None,
          generate_embedding: bool = True) -> dict:
    """Store an episodic memory with optional embedding."""
    import json
    eid = episode_id or str(uuid.uuid4())
    
    # Convert tags to PostgreSQL array literal
    tag_arr = tags or []
    tags_pg = '{' + ','.join(json.dumps(t) for t in tag_arr) + '}' if tag_arr else '{}'
    
    # Convert metadata to JSON string for ::jsonb cast
    meta_str = json.dumps(metadata or {})
    
    # Combine title + summary + content for embedding
    embed_text = f"{title}\n{summary or ''}\n{content}"
    embedding_vec_arr = embed(embed_text) if generate_embedding else None
    
    # Convert embedding to PostgreSQL vector literal string
    embedding_vec_str = '[' + ','.join(str(v) for v in embedding_vec_arr) + ']' \
        if embedding_vec_arr is not None else None
    
    row = execute_one("""
        INSERT INTO memory_episodic
            (id, episode_id, agent_id, episode_type, title, summary,
             content, embedding, tags, metadata)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector, %s::text[], %s::jsonb)
        RETURNING id, episode_id, agent_id, episode_type, title, created_at, expires_at
    """, (uuid.uuid4(), eid, agent_id, episode_type, title, summary or "",
          content, embedding_vec_str, tags_pg, meta_str))
    return dict(row) if row else {}

def search(query: str, threshold: float = 0.7, limit: int = 10,
           agent_id: str = None, episode_type: str = None) -> list[dict]:
    """Semantic search across episodic memory."""
    query_vec_arr = embed(query)
    query_vec_str = '[' + ','.join(str(v) for v in query_vec_arr) + ']'
    rows = execute("""
        SELECT id, episode_id, agent_id, episode_type, title, summary,
               content, tags, similarity, created_at
        FROM search_episodic(
            %s::vector, %s, %s, %s, %s
        )
    """, (query_vec_str, threshold, limit, agent_id, episode_type))
    return [dict(r) for r in rows]

def get_by_episode(episode_id: str) -> list[dict]:
    """Get all entries for an episode."""
    rows = execute("""
        SELECT id, episode_id, agent_id, episode_type, title, summary,
               content, tags, metadata, created_at
        FROM memory_episodic
        WHERE episode_id = %s::uuid AND expires_at > NOW()
        ORDER BY created_at DESC
    """, (episode_id,))
    return [dict(r) for r in rows]

def get_recent(agent_id: str = None, episode_type: str = None,
               limit: int = 20) -> list[dict]:
    """Get recent episodic memories."""
    conditions = ["expires_at > NOW()"]
    params = []
    if agent_id:
        conditions.append("agent_id = %s")
        params.append(agent_id)
    if episode_type:
        conditions.append("episode_type = %s")
        params.append(episode_type)
    
    where = " AND ".join(conditions)
    rows = execute(f"""
        SELECT id, episode_id, agent_id, episode_type, title, summary,
               content, tags, created_at
        FROM memory_episodic
        WHERE {where}
        ORDER BY created_at DESC
        LIMIT %s
    """, (*params, limit))
    return [dict(r) for r in rows]

def get_stats() -> dict:
    """Get count statistics."""
    rows = execute("""
        SELECT episode_type, COUNT(*) AS count
        FROM memory_episodic
        WHERE expires_at > NOW()
        GROUP BY episode_type
        ORDER BY count DESC
    """)
    return {"total": sum(r["count"] for r in rows),
            "by_type": {r["episode_type"]: r["count"] for r in rows}}
