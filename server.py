#!/usr/bin/env python3
"""Dev server for My Services panel.
Serves the project with Cache-Control: no-store so the browser always gets
fresh files (no stale-cache hangs during development)."""
import http.server
import os
import socketserver
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIR)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write('  %s %s\n' % (self.address_string(), fmt % args))


PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
with socketserver.ThreadingTCPServer(('', PORT), Handler) as httpd:
    print('Serving %s on http://localhost:%d (no-cache)' % (DIR, PORT))
    httpd.serve_forever()