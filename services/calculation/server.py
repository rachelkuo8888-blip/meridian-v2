"""Calculation Engine API — Python microservice with stdlib http.server.

Provides:
    GET  /health         → health check
    POST /chart          → generate full natal chart
    POST /daily-energy   → calculate daily energy for a given date

No external dependencies — uses only Python standard library.
"""

import json
import os
import traceback
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from datetime import datetime, date, timezone

from engine.main import generate_chart, ENGINE_VERSION
from engine.bazi import get_day_pillar, get_year_stem_branch
from engine.daily_energy import calculate_daily_energy

HOST = os.environ.get("ENGINE_HOST", "0.0.0.0")
PORT = int(os.environ.get("ENGINE_PORT", "8080"))


class EngineHandler(BaseHTTPRequestHandler):
    """HTTP handler for the Calculation Engine API."""

    def _send_json(self, status_code: int, data: dict) -> None:
        self.send_response(status_code)
        self.send_header("Content-type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def _read_body(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        return json.loads(body.decode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/health":
            self._send_json(200, {
                "status": "ok",
                "engine": ENGINE_VERSION,
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            })
        elif path == "/chart":
            self._send_json(405, {"error": "Use POST /chart"})
        elif path == "/daily-energy":
            self._send_json(405, {"error": "Use POST /daily-energy"})
        else:
            self._send_json(404, {"error": f"Not found: {path}"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            if path == "/chart":
                self._handle_chart()
            elif path == "/daily-energy":
                self._handle_daily_energy()
            else:
                self._send_json(404, {"error": f"Not found: {path}"})
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON in request body"})
        except Exception as e:
            self._send_json(500, {
                "error": str(e),
                "traceback": traceback.format_exc(),
            })

    def _handle_chart(self):
        """POST /chart — generate a full natal chart."""
        data = self._read_body()

        required = ["user_id", "birth_date"]
        for field in required:
            if field not in data:
                self._send_json(400, {"error": f"Missing required field: {field}"})
                return

        # Normalize birth_hour: accept int, float, or "HH:MM" string
        raw_hour = data.get("birth_hour")
        if isinstance(raw_hour, str) and ":" in raw_hour:
            birth_hour = int(raw_hour.split(":")[0])
        elif raw_hour is not None:
            birth_hour = int(raw_hour)
        else:
            birth_hour = None

        chart = generate_chart(
            user_id=data["user_id"],
            birth_date=data["birth_date"],
            birth_hour=birth_hour,
            longitude=data.get("longitude"),
            timezone_std_longitude=data.get("timezone_std_longitude", 120.0),
            gender=data.get("gender"),
        )

        self._send_json(200, {
            "status": "ok",
            "data": json.loads(chart.to_json()),
        })

    def _handle_daily_energy(self):
        """POST /daily-energy — calculate daily energy score."""
        data = self._read_body()

        if "natal_chart" not in data or "target_date" not in data:
            self._send_json(400, {"error": "Missing required fields: natal_chart, target_date"})
            return

        # Reconstruct from JSON
        natal_data = data["natal_chart"]
        target_date_str = data["target_date"]

        from engine.types import (
            NatalChart, FourPillars, Pillar, ElementDistribution, ZiWeiChart
        )

        # Simplified: directly use the day pillar for the target date
        dt = datetime.strptime(target_date_str, "%Y-%m-%d")
        today_pillar = get_day_pillar(dt.date())

        # For now, return the pillar info and let client compute
        self._send_json(200, {
            "status": "ok",
            "target_date": target_date_str,
            "today_pillar": today_pillar.to_dict(),
            "score": 50,  # placeholder — full integration requires client passing natal
        })


def run_server():
    print(f"🔮 Meridian Calculation Engine v{ENGINE_VERSION}")
    print(f"   Listening on http://{HOST}:{PORT}")
    print(f"   Endpoints:")
    print(f"     GET  /health")
    print(f"     POST /chart")
    print(f"     POST /daily-energy")

    server = HTTPServer((HOST, PORT), EngineHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    run_server()
