"""
Tests for the Memory Service
"""
import os
import sys
import unittest
import json
from http.server import HTTPServer
from threading import Thread
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Add parent to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from engine.db import execute, execute_one
from engine import config


# Override config for testing
config.SERVER_HOST = "127.0.0.1"
config.SERVER_PORT = 18300  # Different port for tests


class TestDBConnection(unittest.TestCase):
    """Test database connection and schema."""

    def test_connect(self):
        """Test basic database connectivity."""
        row = execute_one("SELECT 1 AS ok")
        self.assertIsNotNone(row)
        self.assertEqual(row["ok"], 1)

    def test_tables_exist(self):
        """Test all 4 tables exist."""
        rows = execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        names = [r["table_name"] for r in rows]
        self.assertIn("memory_working", names)
        self.assertIn("memory_episodic", names)
        self.assertIn("memory_semantic", names)
        self.assertIn("memory_audit_log", names)

    def test_extensions(self):
        """Test pgvector extension enabled."""
        row = execute_one("""
            SELECT extname FROM pg_extension WHERE extname = 'vector'
        """)
        self.assertIsNotNone(row)
        self.assertEqual(row["extname"], "vector")


class TestWorkingMemory(unittest.TestCase):
    """Test working memory CRUD."""

    def setUp(self):
        self.session_id = "test-session-001"
        execute("DELETE FROM memory_working WHERE session_id = %s", (self.session_id,))

    def test_store_and_retrieve(self):
        """Test storing and retrieving working memory."""
        from engine.working import store, get_session_chronological

        # Store 3 messages
        store(self.session_id, "user", "Hello")
        store(self.session_id, "assistant", "Hi there!")
        store(self.session_id, "user", "What's the weather?")

        msgs = get_session_chronological(self.session_id)
        self.assertEqual(len(msgs), 3)
        self.assertEqual(msgs[0]["content"], "Hello")
        self.assertEqual(msgs[1]["content"], "Hi there!")
        self.assertEqual(msgs[2]["content"], "What's the weather?")

    def test_metadata(self):
        """Test storing metadata."""
        from engine.working import store, get_session_chronological

        store(self.session_id, "user", "test", metadata={"source": "test"})
        msgs = get_session_chronological(self.session_id)
        self.assertEqual(msgs[0]["metadata"]["source"], "test")

    def test_clear_session(self):
        """Test clearing a session."""
        from engine.working import store, clear_session, get_session_chronological

        store(self.session_id, "user", "test")
        count = clear_session(self.session_id)
        self.assertEqual(count, 1)


class TestEpisodicMemory(unittest.TestCase):
    """Test episodic memory CRUD + search."""

    @classmethod
    def setUpClass(cls):
        from unittest.mock import patch
        cls._embed_patcher = patch('engine.episodic.embed', return_value=[0.0] * 1536)
        cls._embed_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls._embed_patcher.stop()

    def setUp(self):
        execute("""
            DELETE FROM memory_episodic
            WHERE agent_id = 'test-agent'
        """)

    def test_store_and_search(self):
        """Test storing and semantic searching episodic memory."""
        from engine.episodic import store, search

        store(
            episode_id=None, agent_id="test-agent", episode_type="task",
            title="Build Memory Service",
            content="The team worked on building a three-layer memory service with pgvector.",
            tags=["architecture", "database"],
        )

        # Search for it (embedding model needed, skip if no API key)
        if os.getenv("OPENAI_API_KEY"):
            results = search("memory service pgvector", threshold=0.5)
            self.assertGreaterEqual(len(results), 1)
            if results:
                self.assertIn("memory", results[0]["title"].lower())
        else:
            print("  [SKIP] No OPENAI_API_KEY, skipping semantic search test")

    def test_get_recent(self):
        """Test getting recent episodic memories."""
        from engine.episodic import store, get_recent

        store(
            episode_id=None, agent_id="test-agent", episode_type="decision",
            title="Test Decision",
            content="A test decision.",
            generate_embedding=False,
        )

        recent = get_recent(agent_id="test-agent", limit=5)
        self.assertGreaterEqual(len(recent), 1)
        self.assertEqual(recent[0]["agent_id"], "test-agent")


class TestSemanticMemory(unittest.TestCase):
    """Test semantic memory CRUD + search."""

    def setUp(self):
        execute("DELETE FROM memory_semantic WHERE concept_id LIKE 'test-%'")

    def test_store_and_retrieve(self):
        """Test storing and retrieving a semantic concept."""
        from engine.semantic import store, get_by_concept

        store(
            concept_id="test-working-memory-def",
            concept_type="fact",
            title="What is Working Memory?",
            content="Working memory is short-term session memory with 24h TTL.",
            tags=["memory", "definition"],
            generate_embedding=False,
        )

        entry = get_by_concept("test-working-memory-def")
        self.assertIsNotNone(entry)
        self.assertEqual(entry["concept_type"], "fact")
        self.assertIn("Working Memory", entry["title"])

    def test_upsert(self):
        """Test upsert updates existing concept."""
        from engine.semantic import store, get_by_concept

        store("test-upsert-fact", "fact", "Title 1", "Content 1", generate_embedding=False)
        store("test-upsert-fact", "fact", "Title 2", "Content 2 updated", generate_embedding=False)

        entry = get_by_concept("test-upsert-fact")
        self.assertEqual(entry["content"], "Content 2 updated")

    def test_list_by_type(self):
        """Test listing concepts by type."""
        from engine.semantic import store, list_by_type

        store("test-type-a", "fact", "Fact A", "Content A", generate_embedding=False)
        store("test-type-b", "rule", "Rule B", "Content B", generate_embedding=False)

        facts = list_by_type("fact")
        rules = list_by_type("rule")

        fact_ids = [e["concept_id"] for e in facts]
        rule_ids = [e["concept_id"] for e in rules]
        self.assertIn("test-type-a", fact_ids)
        self.assertIn("test-type-b", rule_ids)


class TestCleanup(unittest.TestCase):
    """Test TTL cleanup."""

    def test_purge_function(self):
        """Test the purge function exists and runs."""
        from engine.cleanup import purge_expired

        result = purge_expired()
        self.assertIn("memory_working", result)
        self.assertIn("memory_episodic", result)


class TestStats(unittest.TestCase):
    """Test stats endpoints."""

    def test_get_stats(self):
        """Test getting memory stats."""
        from engine.search import get_memory_stats

        stats = get_memory_stats()
        self.assertIn("working", stats)
        self.assertIn("episodic", stats)
        self.assertIn("semantic", stats)


class TestServer(unittest.TestCase):
    """Test HTTP API server."""

    @classmethod
    def setUpClass(cls):
        from engine.server import create_server
        cls.server = create_server()
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://{config.SERVER_HOST}:{config.SERVER_PORT}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def _get(self, path):
        resp = urlopen(f"{self.base}{path}")
        return json.loads(resp.read().decode())

    def _post(self, path, data: dict):
        body = json.dumps(data).encode("utf-8")
        req = Request(f"{self.base}{path}", data=body,
                      headers={"Content-Type": "application/json"})
        resp = urlopen(req)
        return json.loads(resp.read().decode())

    def test_health(self):
        result = self._get("/health")
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["service"], "meridian-memory")

    def test_stats(self):
        result = self._get("/memory/stats")
        self.assertIn("working", result)
        self.assertIn("episodic", result)
        self.assertIn("semantic", result)

    def test_store_working_memory(self):
        result = self._post("/memory/working", {
            "session_id": "api-test-session",
            "role": "user",
            "content": "API test message",
        })
        self.assertIn("id", result)
        self.assertEqual(result["session_id"], "api-test-session")

    def test_store_episodic(self):
        result = self._post("/memory/episodic", {
            "agent_id": "api-test",
            "episode_type": "task",
            "title": "API Test Task",
            "content": "Testing via API",
            "embed": False,
        })
        self.assertIn("id", result)
        self.assertEqual(result["agent_id"], "api-test")

    def test_store_semantic(self):
        result = self._post("/memory/semantic", {
            "concept_id": "api-test-concept",
            "concept_type": "fact",
            "title": "API Test Fact",
            "content": "Test fact stored via API",
            "embed": False,
        })
        self.assertIn("id", result)
        self.assertEqual(result["concept_id"], "api-test-concept")

    def test_404(self):
        with self.assertRaises(HTTPError) as ctx:
            self._get("/nonexistent")
        self.assertEqual(ctx.exception.code, 404)


if __name__ == "__main__":
    unittest.main(verbosity=2)
