/**
 * Memory Service HTTP client.
 * Talks to the Python microservice at services/memory/engine/server.py
 * Port: 8300
 */

const MEMORY_URL = process.env.MEMORY_SERVICE_URL ?? 'http://localhost:8300';

async function request<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
  },
): Promise<T> {
  const url = `${MEMORY_URL}${path}`;
  const method = options?.method ?? (options?.body ? 'POST' : 'GET');

  const res = await fetch(url, {
    method,
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(
      `MemoryService ${method} ${path}: ${err.error ?? res.status}`,
    );
  }

  return res.json();
}

// ---- Working Memory ----
export const workingMemory = {
  /** Store a working memory entry */
  store: (
    sessionId: string,
    role: string,
    content: string,
    metadata?: Record<string, unknown>,
  ) =>
    request<{
      id: string;
      session_id: string;
      role: string;
      created_at: string;
    }>('/memory/working', {
      body: { session_id: sessionId, role, content, metadata },
    }),

  /** Get all entries for a session */
  getSession: (sessionId: string) =>
    request<Array<Record<string, unknown>>>(`/memory/working/${sessionId}`),

  /** Clear all entries for a session */
  clearSession: (sessionId: string) =>
    request<{ deleted: number }>('/memory/working', {
      method: 'DELETE',
      body: { session_id: sessionId },
    }),
};

// ---- Episodic Memory ----
export const episodicMemory = {
  store: (data: {
    episode_id?: string;
    agent_id: string;
    episode_type: string;
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    embed?: boolean;
  }) => request<Record<string, unknown>>('/memory/episodic', { body: data }),

  search: (query: string, threshold?: number, limit?: number) =>
    request<Array<Record<string, unknown>>>('/memory/episodic/search', {
      body: { query, threshold, limit },
    }),

  getRecent: (agentId?: string, episodeType?: string, limit?: number) =>
    request<Array<Record<string, unknown>>>('/memory/episodic/recent', {
      body: { agent_id: agentId, episode_type: episodeType, limit },
    }),
};

// ---- Semantic Memory ----
export const semanticMemory = {
  store: (data: {
    concept_id: string;
    concept_type: string;
    title: string;
    content: string;
    source?: string;
    confidence?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
    embed?: boolean;
  }) => request<Record<string, unknown>>('/memory/semantic', { body: data }),

  get: (conceptId: string) =>
    request<Record<string, unknown>>(`/memory/semantic/${conceptId}`),

  listByType: (conceptType: string) =>
    request<Array<Record<string, unknown>>>('/memory/semantic', {
      body: { concept_type: conceptType },
    }),

  search: (
    query: string,
    threshold?: number,
    limit?: number,
    conceptType?: string,
  ) =>
    request<Array<Record<string, unknown>>>('/memory/semantic/search', {
      body: { query, threshold, limit, concept_type: conceptType },
    }),
};

// ---- Stats ----
export const memoryStats = () =>
  request<{
    working: number;
    episodic: number;
    semantic: number;
  }>('/memory/stats');

// ---- Health ----
export const memoryHealth = () =>
  request<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
  }>('/health');
