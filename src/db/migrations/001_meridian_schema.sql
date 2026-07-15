-- Meridian V2: Complete Schema Migration
-- Based on Technical Architecture §7 — Database Design

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE birth_time_confidence AS ENUM ('exact', 'approximate', 'unknown');
CREATE TYPE subscription_plan AS ENUM ('free', 'plus', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'canceled', 'expired');
CREATE TYPE subscription_provider AS ENUM ('stripe', 'apple_iap', 'google_play');
CREATE TYPE memory_source_type AS ENUM ('checkin', 'conversation', 'journal');
CREATE TYPE coach_user_reaction AS ENUM ('opened', 'dismissed', 'replied');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- ============================================================================
-- TABLE: users
-- ============================================================================

CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           text UNIQUE NOT NULL,
    auth_provider   text NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'apple', 'google')),
    display_name    text,
    avatar_url      text,
    timezone        text NOT NULL DEFAULT 'UTC',
    locale          text DEFAULT 'en',
    onboarding_completed boolean NOT NULL DEFAULT false,
    settings_json   jsonb DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at);

-- ============================================================================
-- TABLE: birth_profiles
-- ============================================================================

CREATE TABLE birth_profiles (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_date          date NOT NULL,
    birth_time          time,
    birth_time_confidence birth_time_confidence NOT NULL DEFAULT 'unknown',
    birth_location      text,        -- City, Country (user-facing)
    latitude            double precision,
    longitude           double precision,
    gender              text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_birth_profile UNIQUE (user_id)
);

CREATE INDEX idx_birth_profiles_user ON birth_profiles (user_id);

-- ============================================================================
-- TABLE: natal_charts
-- Calculation Engine output cache — ChartObject JSON
-- ============================================================================

CREATE TABLE natal_charts (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_json      jsonb NOT NULL,
    engine_version  text NOT NULL,
    computed_at     timestamptz NOT NULL DEFAULT now(),
    invalidated_at  timestamptz,        -- Set when engine_version changes and re-computation is needed
    CONSTRAINT unique_user_natal_chart UNIQUE (user_id)
);

CREATE INDEX idx_natal_charts_user ON natal_charts (user_id);
CREATE INDEX idx_natal_charts_engine_version ON natal_charts (engine_version);

-- ============================================================================
-- TABLE: checkins
-- Daily mood/energy check-ins
-- ============================================================================

CREATE TABLE checkins (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_score      integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    energy_score    integer NOT NULL CHECK (energy_score >= 1 AND energy_score <= 10),
    tags            text[] DEFAULT '{}',
    note            text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_user_id ON checkins (user_id);
CREATE INDEX idx_checkins_user_date ON checkins (user_id, created_at DESC);
CREATE INDEX idx_checkins_tags ON checkins USING GIN (tags);

-- ============================================================================
-- TABLE: memory_embeddings
-- L2 Episodic Memory — vector search for semantic retrieval
-- ============================================================================

CREATE TABLE memory_embeddings (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type     memory_source_type NOT NULL,
    source_id       uuid,                       -- FK to checkins, conversations, etc.
    content_summary text NOT NULL,
    embedding       vector(1536) NOT NULL,       -- OpenAI text-embedding-3-small / ada-002
    metadata        jsonb DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_embeddings_user ON memory_embeddings (user_id);
CREATE INDEX idx_memory_embeddings_source ON memory_embeddings (source_type, source_id);
CREATE INDEX idx_memory_embeddings_vector ON memory_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================================
-- TABLE: memory_facts
-- L3 Semantic Memory / User Profile — single row per user, updated by extraction job
-- ============================================================================

CREATE TABLE memory_facts (
    user_id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profile_json    jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_extracted_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: conversations
-- Coach chat sessions
-- ============================================================================

CREATE TABLE conversations (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           text,
    intent          text,                        -- From Prompt Router: daily_briefing, ask_anything, etc.
    message_count   integer NOT NULL DEFAULT 0,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user ON conversations (user_id, updated_at DESC);

-- ============================================================================
-- TABLE: messages
-- Individual messages within conversations
-- ============================================================================

CREATE TABLE messages (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         text NOT NULL,
    metadata        jsonb DEFAULT '{}'::jsonb,
    token_count     integer,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_user ON messages (user_id, created_at DESC);

-- ============================================================================
-- TABLE: coach_events
-- Triggered coach message history
-- ============================================================================

CREATE TABLE coach_events (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rule_id         text NOT NULL,
    triggered_at    timestamptz NOT NULL DEFAULT now(),
    message_sent    text NOT NULL,
    user_reaction   coach_user_reaction,
    metadata        jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_coach_events_user ON coach_events (user_id, triggered_at DESC);
CREATE INDEX idx_coach_events_rule ON coach_events (rule_id);

-- ============================================================================
-- TABLE: subscriptions
-- ============================================================================

CREATE TABLE subscriptions (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan            subscription_plan NOT NULL DEFAULT 'free',
    status          subscription_status NOT NULL DEFAULT 'active',
    provider        subscription_provider,
    provider_subscription_id text,
    current_period_start timestamptz,
    current_period_end   timestamptz,
    trial_end       timestamptz,
    canceled_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- ============================================================================
-- TABLE: notifications
-- ============================================================================

CREATE TABLE notifications (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           text NOT NULL,
    body            text,
    channel         notification_channel NOT NULL DEFAULT 'in_app',
    status          notification_status NOT NULL DEFAULT 'pending',
    metadata        jsonb DEFAULT '{}'::jsonb,
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications (status);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE status != 'read' AND status != 'failed';

-- ============================================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_birth_profiles_updated_at
    BEFORE UPDATE ON birth_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts. Created via Supabase Auth, synced here.';
COMMENT ON TABLE birth_profiles IS 'User birth data for calculation engine. One per user.';
COMMENT ON TABLE natal_charts IS 'Cached calculation engine output. JSON ChartObject.';
COMMENT ON TABLE checkins IS 'Daily mood/energy/tags check-ins. Core data for memory service.';
COMMENT ON TABLE memory_embeddings IS 'L2 Episodic memory — vector embeddings for semantic search.';
COMMENT ON TABLE memory_facts IS 'L3 Semantic memory — rolled-up user profile, updated by extraction job.';
COMMENT ON TABLE conversations IS 'Coach chat sessions with routing intent tracking.';
COMMENT ON TABLE messages IS 'Individual messages within conversations.';
COMMENT ON TABLE coach_events IS 'Triggered coach message history for frequency control and optimization.';
COMMENT ON TABLE subscriptions IS 'Free/Plus/Pro subscription state.';
COMMENT ON TABLE notifications IS 'Push/email/in-app notification queue.';
