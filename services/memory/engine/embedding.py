"""
Meridian Memory Service — Embedding Client
"""
import os
from openai import OpenAI
from .config import OPENAI_API_KEY, EMBEDDING_MODEL

_client = None

def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        _client = OpenAI(api_key=api_key)
    return _client

def embed(text: str) -> list[float]:
    """Generate embedding vector for a text string."""
    client = get_client()
    resp = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return resp.data[0].embedding

def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts (more efficient)."""
    client = get_client()
    resp = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    # Sort by index to maintain order
    sorted_data = sorted(resp.data, key=lambda x: x.index)
    return [d.embedding for d in sorted_data]
