"""
Semantic Memory — Long-term knowledge (permanent) with semantic search
"""
import uuid
from datetime import datetime, timezone
from .db import execute, execute_one
from .embedding import embed

def store(concept_id: str, concept_type: str, title: str, content: str,
          source: str = None, confidence: float = 0.5,
          tags: list[str] = None, metadata: dict = None,
          generate_embedding: bool = True) -> dict:
    """Store or update a semantic memory (upsert by concept_id)."""
    import json
    
    # Convert tags to PostgreSQL array literal
    tag_arr = tags or []
    tags_pg = '{' + ','.join(json.dumps(t) for t in tag_arr) + '}' if tag_arr else '{}'
    
    # Convert metadata to JSON string for ::jsonb cast
    meta_str = json.dumps(metadata or {})
    
    embed_text = f"{title}\n{content}"
    embedding_vec_arr = embed(embed_text) if generate_embedding else None
    
    # Convert embedding to PostgreSQL vector literal string
    embedding_vec_str = '[' + ','.join(str(v) for v in embedding_vec_arr) + ']' \
        if embedding_vec_arr is not None else None
    
    # UPSERT: insert or update if concept_id already exists
    row = execute_one("""
        INSERT INTO memory_semantic
            (id, concept_id, concept_type, title, content, embedding,
             source, confidence, tags, metadata)
        VALUES (%s, %s, %s, %s, %s, %s::vector, %s, %s, %s::text[], %s::jsonb)
        ON CONFLICT (concept_id)
        DO UPDATE SET
            content = EXCLUDED.content,
            embedding = EXCLUDED.embedding,
            source = EXCLUDED.source,
            confidence = EXCLUDED.confidence,
            tags = EXCLUDED.tags,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        RETURNING id, concept_id, concept_type, title, created_at, updated_at
    """, (uuid.uuid4(), concept_id, concept_type, title, content,
          embedding_vec_str, source, confidence, tags_pg, meta_str))
    return dict(row) if row else {}

def search(query: str, threshold: float = 0.7, limit: int = 10,
           concept_type: str = None) -> list[dict]:
    """Semantic search across semantic memory."""
    query_vec_arr = embed(query)
    query_vec_str = '[' + ','.join(str(v) for v in query_vec_arr) + ']'
    rows = execute("""
        SELECT id, concept_id, concept_type, title, content, source,
               confidence, created_at, updated_at,
               1 - (embedding <=> %s::vector) AS similarity
        FROM memory_semantic
        WHERE embedding IS NOT NULL
          AND 1 - (embedding <=> %s::vector) >= %s
    """, (query_vec_str, query_vec_str, threshold))

def get_by_concept(concept_id: str) -> dict | None:
    """Get a semantic memory by concept_id."""
    row = execute_one("""
        SELECT id, concept_id, concept_type, title, content, source,
               confidence, tags, metadata, created_at, updated_at
        FROM memory_semantic
        WHERE concept_id = %s
    """, (concept_id,))
    return dict(row) if row else None

def list_by_type(concept_type: str, limit: int = 50) -> list[dict]:
    """List all semantic memories of a given type."""
    rows = execute("""
        SELECT id, concept_id, concept_type, title, content, source,
               confidence, tags, created_at
        FROM memory_semantic
        WHERE concept_type = %s
        ORDER BY confidence DESC, created_at DESC
        LIMIT %s
    """, (concept_type, limit))
    return [dict(r) for r in rows]

def update_confidence(concept_id: str, confidence: float) -> dict | None:
    """Update the confidence score of a semantic memory."""
    row = execute_one("""
        UPDATE memory_semantic
        SET confidence = %s, updated_at = NOW()
        WHERE concept_id = %s
        RETURNING id, concept_id, concept_type, title, confidence, updated_at
    """, (confidence, concept_id))
    return dict(row) if row else None

def delete(concept_id: str) -> bool:
    """Delete a semantic memory by concept_id."""
    result = execute("""
        DELETE FROM memory_semantic WHERE concept_id = %s
    """, (concept_id,))
    return True

def get_stats() -> dict:
    """Get count statistics."""
    rows = execute("""
        SELECT concept_type, COUNT(*) AS count, AVG(confidence)::REAL AS avg_confidence
        FROM memory_semantic
        GROUP BY concept_type
        ORDER BY count DESC
    """)
    return {"total": sum(r["count"] for r in rows),
            "by_type": {r["concept_type"]: {"count": r["count"],
                                              "avg_confidence": r["avg_confidence"]}
                        for r in rows}}
