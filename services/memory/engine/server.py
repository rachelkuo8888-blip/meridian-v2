"""
Meridian Memory Service — HTTP API Server
"""
import json
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone

from .config import SERVER_HOST, SERVER_PORT
from . import working, episodic, semantic, search, cleanup


class MemoryHandler(BaseHTTPRequestHandler):
    """HTTP handler for Memory Service API."""

    def _send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, message, status=400):
        self._send_json({"error": message}, status)

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def _parse_path(self):
        """Parse path into parts."""
        path = self.path.rstrip("/")
        parts = path.split("/")
        # Remove empty first element
        parts = [p for p in parts if p]
        return parts

    # ---- Routes ----

    def do_GET(self):
        parts = self._parse_path()

        # /health
        if self.path == "/health":
            return self._send_json({
                "status": "ok",
                "service": "meridian-memory",
                "version": "1.0.0",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

        # /memory/stats
        if self.path == "/memory/stats":
            return self._send_json(search.get_memory_stats())

        # /memory/working/:session_id
        if len(parts) == 3 and parts[0] == "memory" and parts[1] == "working":
            session_id = parts[2]
            try:
                msgs = working.get_session_chronological(session_id)
                return self._send_json({"session_id": session_id, "messages": msgs})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/episodic/get/:episode_id
        if len(parts) == 4 and parts[0] == "memory" and parts[1] == "episodic" and parts[2] == "get":
            episode_id = parts[3]
            try:
                entries = episodic.get_by_episode(episode_id)
                return self._send_json({"episode_id": episode_id, "entries": entries})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/episodic/recent
        if self.path == "/memory/episodic/recent":
            agent = self.headers.get("X-Agent-Id")
            etype = self.headers.get("X-Episode-Type")
            try:
                entries = episodic.get_recent(agent, etype)
                return self._send_json({"entries": entries})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/semantic/get/:concept_id
        if len(parts) == 4 and parts[0] == "memory" and parts[1] == "semantic" and parts[2] == "get":
            concept_id = parts[3]
            try:
                entry = semantic.get_by_concept(concept_id)
                if entry:
                    return self._send_json(entry)
                return self._send_error("not found", 404)
            except Exception as e:
                return self._send_error(str(e))

        # /memory/semantic/list/:type
        if len(parts) == 4 and parts[0] == "memory" and parts[1] == "semantic" and parts[2] == "list":
            ctype = parts[3]
            try:
                entries = semantic.list_by_type(ctype)
                return self._send_json({"concept_type": ctype, "entries": entries})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/cleanup/check  (preview expired counts)
        if self.path == "/memory/cleanup/check":
            try:
                counts = cleanup.get_expiry_counts()
                return self._send_json(counts)
            except Exception as e:
                return self._send_error(str(e))

        return self._send_error(f"not found: {self.path}", 404)

    def do_POST(self):
        parts = self._parse_path()

        try:
            body = self._read_body()
        except json.JSONDecodeError:
            return self._send_error("invalid JSON")

        # /memory/working
        if self.path == "/memory/working":
            session_id = body.get("session_id") or str(uuid.uuid4())
            role = body.get("role", "user")
            content = body.get("content", "")
            agent_id = body.get("agent_id", "default")
            metadata = body.get("metadata")
            try:
                result = working.store(session_id, role, content, agent_id, metadata)
                return self._send_json(result, 201)
            except Exception as e:
                return self._send_error(str(e))

        # /memory/working/search
        if self.path == "/memory/working/search":
            session_id = body.get("session_id", "")
            query = body.get("query", "")
            limit = body.get("limit", 10)
            try:
                results = working.search_session(session_id, query, limit)
                return self._send_json({"session_id": session_id, "query": query, "results": results})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/episodic
        if self.path == "/memory/episodic":
            try:
                result = episodic.store(
                    episode_id=body.get("episode_id"),
                    agent_id=body.get("agent_id", "default"),
                    episode_type=body.get("episode_type", "event"),
                    title=body.get("title", ""),
                    content=body.get("content", ""),
                    summary=body.get("summary"),
                    tags=body.get("tags"),
                    metadata=body.get("metadata"),
                    generate_embedding=body.get("embed", True),
                )
                return self._send_json(result, 201)
            except Exception as e:
                return self._send_error(str(e))

        # /memory/episodic/search
        if self.path == "/memory/episodic/search":
            query = body.get("query", "")
            threshold = body.get("threshold", 0.7)
            limit = body.get("limit", 10)
            agent_id = body.get("agent_id")
            episode_type = body.get("episode_type")
            try:
                results = episodic.search(query, threshold, limit, agent_id, episode_type)
                return self._send_json({"query": query, "results": results})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/semantic
        if self.path == "/memory/semantic":
            try:
                result = semantic.store(
                    concept_id=body.get("concept_id", str(uuid.uuid4())),
                    concept_type=body.get("concept_type", "knowledge"),
                    title=body.get("title", ""),
                    content=body.get("content", ""),
                    source=body.get("source"),
                    confidence=body.get("confidence", 0.5),
                    tags=body.get("tags"),
                    metadata=body.get("metadata"),
                    generate_embedding=body.get("embed", True),
                )
                return self._send_json(result, 201)
            except Exception as e:
                return self._send_error(str(e))

        # /memory/semantic/search
        if self.path == "/memory/semantic/search":
            query = body.get("query", "")
            threshold = body.get("threshold", 0.7)
            limit = body.get("limit", 10)
            concept_type = body.get("concept_type")
            try:
                results = semantic.search(query, threshold, limit, concept_type)
                return self._send_json({"query": query, "results": results})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/search (unified)
        if self.path == "/memory/search":
            query = body.get("query", "")
            threshold = body.get("threshold", 0.7)
            limit = body.get("limit", 10)
            try:
                results = search.search_all(query, threshold, limit)
                return self._send_json(results)
            except Exception as e:
                return self._send_error(str(e))

        # /memory/cleanup
        if self.path == "/memory/cleanup":
            try:
                result = cleanup.purge_expired()
                return self._send_json({"purged": result})
            except Exception as e:
                return self._send_error(str(e))

        return self._send_error(f"not found: {self.path}", 404)

    def do_DELETE(self):
        parts = self._parse_path()

        # /memory/working/:session_id
        if len(parts) == 3 and parts[0] == "memory" and parts[1] == "working":
            session_id = parts[2]
            try:
                count = working.clear_session(session_id)
                return self._send_json({"deleted": count})
            except Exception as e:
                return self._send_error(str(e))

        # /memory/semantic/:concept_id
        if len(parts) == 3 and parts[0] == "memory" and parts[1] == "semantic":
            concept_id = parts[2]
            try:
                semantic.delete(concept_id)
                return self._send_json({"deleted": concept_id})
            except Exception as e:
                return self._send_error(str(e))

        return self._send_error(f"not found: {self.path}", 404)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Agent-Id, X-Episode-Type")
        self.end_headers()

    def log_message(self, format, *args):
        """Quiet logging."""
        print(f"[MemoryAPI] {args[0]} {args[1]} {args[2]}")


def create_server():
    return HTTPServer((SERVER_HOST, SERVER_PORT), MemoryHandler)


def run_server(host: str = None, port: int = None):
    h = host or SERVER_HOST
    p = port or SERVER_PORT
    server = HTTPServer((h, p), MemoryHandler)
    print(f"[MemoryService] Running on http://{h}:{p}")
    print(f"[MemoryService] Health: http://{h}:{p}/health")
    print(f"[MemoryService] Layers: working / episodic / semantic")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[MemoryService] Shutting down...")
        server.server_close()


if __name__ == "__main__":
    run_server()
