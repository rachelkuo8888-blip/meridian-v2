"""
Unified Search — Across all three memory layers
"""
from .db import execute
from .embedding import embed

def search_all(query: str, threshold: float = 0.7, limit: int = 10) -> dict:
    """Unified search across episodic + semantic layers."""
    query_vec = embed(query)
    rows = execute("""
        SELECT layer, id, title, content, tags, similarity, created_at
        FROM search_all_memory(%s::vector, %s, %s)
        ORDER BY similarity DESC
    """, (query_vec, threshold, limit))
    results = [dict(r) for r in rows]
    
    return {
        "query": query,
        "threshold": threshold,
        "total": len(results),
        "results": results,
    }

def get_memory_stats() -> dict:
    """Get stats for all memory layers."""
    from .working import count_active_sessions
    from .episodic import get_stats as episodic_stats
    from .semantic import get_stats as semantic_stats
    
    return {
        "working": {"active_sessions_30min": count_active_sessions()},
        "episodic": episodic_stats(),
        "semantic": semantic_stats(),
    }
