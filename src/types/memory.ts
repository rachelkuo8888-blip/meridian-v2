/**
 * Meridian V2 — Memory Service types
 * Source: services/memory/engine/
 */

export interface WorkingMemoryEntry {
  id: string;
  session_id: string;
  agent_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string;
}

export interface EpisodicMemoryEntry {
  id: string;
  episode_id: string;
  agent_id: string;
  episode_type: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string;
  similarity?: number;
}

export interface SemanticMemoryEntry {
  id: string;
  concept_id: string;
  concept_type: string;
  title: string;
  content: string;
  source: string | null;
  confidence: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  similarity?: number;
}

export interface MemoryStats {
  working: number;
  episodic: number;
  semantic: number;
}
