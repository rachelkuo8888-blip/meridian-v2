"""
Meridian Memory Service — Database Connection
"""
import psycopg2
import json
import psycopg2.extras
from contextlib import contextmanager
from .config import get_dsn

# Register adapters
import uuid
psycopg2.extras.register_uuid()
psycopg2.extras.register_default_json(loads=json.loads)

# Register JSONB adapter for dict/list
from psycopg2.extensions import register_adapter, AsIs
def adapt_json(val):
    return AsIs(f"'{json.dumps(val)}'::jsonb")
register_adapter(dict, adapt_json)
register_adapter(list, adapt_json)

# Register pgvector adapter lazily (needs a connection)
def _register_vector(conn):
    try:
        from pgvector.psycopg2 import register_vector
        register_vector(conn)
        # Re-register list adapter to use pgvector's vector adapter for lists,
        # since our JSONB adapter overrides it
        from pgvector.psycopg2 import _vector as pgv_vec
        from psycopg2.extensions import register_adapter as reg_ad
        reg_ad(list, pgv_vec.VECTOR)
        reg_ad(tuple, pgv_vec.VECTOR)
    except ImportError:
        pass

_conn_pool = None

def get_connection():
    """Get a database connection (simple approach, no pool for MVP)."""
    conn = psycopg2.connect(get_dsn())
    _register_vector(conn)
    return conn

@contextmanager
def get_db():
    """Context manager for database sessions."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def execute(sql: str, params: tuple = None) -> list:
    """Execute SQL and return rows."""
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            try:
                return cur.fetchall()
            except psycopg2.ProgrammingError:
                return []

def execute_one(sql: str, params: tuple = None) -> dict | None:
    """Execute SQL and return first row."""
    rows = execute(sql, params)
    return rows[0] if rows else None
