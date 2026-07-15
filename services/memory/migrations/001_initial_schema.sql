-- Meridian Memory Service — Database Schema v1.0
-- PostgreSQL 16 + pgvector 0.6.0

-- ============================================================
-- LAYER 1: Working Memory (短期 — TTL 24h)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_working (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT NOT NULL,
  agent_id    TEXT NOT NULL DEFAULT 'default',
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_working_session
  ON memory_working(session_id, created_at DESC);

-- TTL cleanup done by cron function, not by partial index
-- CREATE INDEX IF NOT EXISTS idx_working_expires
--   ON memory_working(expires_at)
--   WHERE expires_at < NOW();

-- ============================================================
-- LAYER 2: Episodic Memory (中期 — TTL 90d + embedding)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_episodic (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id    UUID NOT NULL,
  agent_id      TEXT NOT NULL DEFAULT 'default',
  episode_type  TEXT NOT NULL CHECK (episode_type IN ('task', 'decision', 'event', 'interaction')),
  title         TEXT NOT NULL,
  summary       TEXT,
  content       TEXT NOT NULL,
  embedding     VECTOR(1536),
  tags          TEXT[] DEFAULT '{}'::text[],
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '90 days'
);

CREATE INDEX IF NOT EXISTS idx_episodic_agent
  ON memory_episodic(agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_episodic_type
  ON memory_episodic(episode_type);

CREATE INDEX IF NOT EXISTS idx_episodic_tags
  ON memory_episodic USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_episodic_embedding
  ON memory_episodic USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- TTL cleanup done by cron function
-- CREATE INDEX IF NOT EXISTS idx_episodic_expires
--   ON memory_episodic(expires_at)
--   WHERE expires_at < NOW();

-- ============================================================
-- LAYER 3: Semantic Memory (长期 — permanent + embedding)
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_semantic (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id      TEXT NOT NULL UNIQUE,
  concept_type    TEXT NOT NULL CHECK (concept_type IN ('fact', 'rule', 'pattern', 'preference', 'knowledge')),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  embedding       VECTOR(1536),
  source          TEXT,
  confidence      REAL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  tags            TEXT[] DEFAULT '{}'::text[],
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_semantic_concept
  ON memory_semantic(concept_id);

CREATE INDEX IF NOT EXISTS idx_semantic_type
  ON memory_semantic(concept_type);

CREATE INDEX IF NOT EXISTS idx_semantic_tags
  ON memory_semantic USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_semantic_embedding
  ON memory_semantic USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name  TEXT NOT NULL,
  record_id   UUID,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'PURGE')),
  old_data    JSONB,
  new_data    JSONB,
  agent_id    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table
  ON memory_audit_log(table_name, created_at DESC);

-- ============================================================
-- AUTO-CLEANUP FUNCTION (called by cron)
-- ============================================================
CREATE OR REPLACE FUNCTION memory_purge_expired()
RETURNS TABLE(deleted_table TEXT, deleted_count BIGINT) AS $$
DECLARE
  w_count BIGINT;
  e_count BIGINT;
BEGIN
  DELETE FROM memory_working WHERE expires_at < NOW();
  GET DIAGNOSTICS w_count = ROW_COUNT;

  DELETE FROM memory_episodic WHERE expires_at < NOW();
  GET DIAGNOSTICS e_count = ROW_COUNT;

  INSERT INTO memory_audit_log (table_name, action, new_data, agent_id)
  VALUES ('memory_working', 'PURGE', jsonb_build_object('count', w_count), 'system'),
         ('memory_episodic', 'PURGE', jsonb_build_object('count', e_count), 'system');

  deleted_table := 'memory_working'; deleted_count := w_count; RETURN NEXT;
  deleted_table := 'memory_episodic'; deleted_count := e_count; RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEARCH FUNCTIONS (semantic + hybrid)
-- ============================================================

-- Search episodic memory by embedding similarity
CREATE OR REPLACE FUNCTION search_episodic(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_agent TEXT DEFAULT NULL,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  episode_id UUID,
  title TEXT,
  summary TEXT,
  content TEXT,
  tags TEXT[],
  similarity FLOAT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.episode_id,
    e.title,
    e.summary,
    e.content,
    e.tags,
    1 - (e.embedding <=> query_embedding) AS similarity,
    e.created_at
  FROM memory_episodic e
  WHERE
    e.embedding IS NOT NULL
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
    AND (filter_agent IS NULL OR e.agent_id = filter_agent)
    AND (filter_type IS NULL OR e.episode_type = filter_type)
    AND e.expires_at > NOW()
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Search semantic memory by embedding similarity
CREATE OR REPLACE FUNCTION search_semantic(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  concept_id TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  similarity FLOAT,
  confidence REAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.concept_id,
    s.title,
    s.content,
    s.tags,
    1 - (s.embedding <=> query_embedding) AS similarity,
    s.confidence,
    s.created_at
  FROM memory_semantic s
  WHERE
    s.embedding IS NOT NULL
    AND (1 - (s.embedding <=> query_embedding)) > match_threshold
    AND (filter_type IS NULL OR s.concept_type = filter_type)
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Unified search across episodic + semantic
CREATE OR REPLACE FUNCTION search_all_memory(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE(
  layer TEXT,
  id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  similarity FLOAT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  per_layer INT := CEIL(match_count / 2.0);
BEGIN
  RETURN QUERY
  SELECT 'episodic' AS layer, e.id, e.title, e.content, e.tags,
         1 - (e.embedding <=> query_embedding), e.created_at
  FROM memory_episodic e
  WHERE e.embedding IS NOT NULL
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
    AND e.expires_at > NOW()
  ORDER BY e.embedding <=> query_embedding
  LIMIT per_layer;

  RETURN QUERY
  SELECT 'semantic' AS layer, s.id, s.title, s.content, s.tags,
         1 - (s.embedding <=> query_embedding), s.created_at
  FROM memory_semantic s
  WHERE s.embedding IS NOT NULL
    AND (1 - (s.embedding <=> query_embedding)) > match_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT per_layer;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- WORKING MEMORY: full-text search
-- ============================================================
ALTER TABLE memory_working ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX IF NOT EXISTS idx_working_fts
  ON memory_working USING GIN(search_vector);

-- ============================================================
-- VERIFICATION
-- ============================================================
DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  RAISE NOTICE 'Migration complete. % tables created.', table_count;
END;
$$;
