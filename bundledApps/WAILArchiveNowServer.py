"""Local Archive Now HTTP endpoint for WAIL.

This module intentionally keeps the HTTP endpoint out of WAIL.py so the
OpenWayback "Resource Not In Archive" page can link to a small local service
without embedding scripts or HTML in WaybackUI.properties.
"""

from __future__ import annotations

import html
import logging
import threading
from collections.abc import Callable
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


class ArchiveNowRequestHandler(BaseHTTPRequestHandler):
    """Handle one-click archive requests from the local OpenWayback UI."""

    def do_GET(self) -> None:
        parsed_path = urlparse(self.path)
        if parsed_path.path != "/archive-now":
            self.send_error(404)
            return

        params = parse_qs(parsed_path.query)
        uri = params.get("url", params.get("uri", [""]))[0].strip()
        parsed_uri = urlparse(uri)

        if parsed_uri.scheme not in ("http", "https") or not parsed_uri.netloc:
            self._write_html(
                400,
                "WAIL Archive Now",
                "A valid http(s) URI is required.",
            )
            return

        self.server.archive_callback(uri)
        self._write_html(
            202,
            "WAIL Archive Now",
            (
                "WAIL is archiving "
                f'<a href="{html.escape(uri, quote=True)}">'
                f"{html.escape(uri)}</a>."
            ),
        )

    def _write_html(self, status_code: int, title: str, body: str) -> None:
        payload = (
            "<!doctype html><html><head>"
            f"<title>{html.escape(title)}</title>"
            "</head><body>"
            f"<h1>{html.escape(title)}</h1><p>{body}</p>"
            "</body></html>"
        ).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format: str, *args) -> None:
        logging.debug("ArchiveNowServer: " + format, *args)


class ArchiveNowServer:
    """Expose a local endpoint that lets OpenWayback ask WAIL to crawl a URI."""

    def __init__(
        self,
        archive_callback: Callable[[str], None],
        host: str = "127.0.0.1",
        port: int = 18080,
    ) -> None:
        self.archive_callback = archive_callback
        self.host = host
        self.port = port
        self.httpd: ThreadingHTTPServer | None = None
        self.thread: threading.Thread | None = None

    def start(self) -> None:
        if self.httpd is not None:
            return

        try:
            self.httpd = ThreadingHTTPServer(
                (self.host, self.port),
                ArchiveNowRequestHandler,
            )
        except OSError as err:
            logging.warning("ArchiveNowServer could not start: %s", err)
            return

        self.httpd.archive_callback = self.archive_callback
        self.thread = threading.Thread(
            target=self.httpd.serve_forever,
            name="ArchiveNowServer",
            daemon=True,
        )
        self.thread.start()

    def stop(self) -> None:
        if self.httpd is None:
            return

        self.httpd.shutdown()
        self.httpd.server_close()
        self.httpd = None
        self.thread = None
