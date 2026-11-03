"""Loopback-only, dependency-free server for MathMotion Studio."""
import argparse
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser
import zipfile


def asset(name):
    if zipfile.is_zipfile(sys.argv[0]):
        with zipfile.ZipFile(sys.argv[0]) as bundle:
            return bundle.read('web/' + name)
    return (Path(__file__).parent / 'web' / name).read_bytes()


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        name = self.path.split('?')[0].removeprefix('/') or 'index.html'
        if name not in {'index.html', 'app.js', 'engine.js', 'style.css'}:
            self.send_error(404)
            return
        data = asset(name)
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(data)


def main():
    parser = argparse.ArgumentParser(description='Launch MathMotion Studio in your browser.')
    parser.add_argument('--port', type=int, default=8765, help='Local port; use 0 for an available port')
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    except OSError as error:
        parser.exit(1, f'{error}\nTry mathmotion --port 0\n')
    url = f'http://127.0.0.1:{server.server_port}'
    print(f'MathMotion Studio: {url}\nPress Ctrl+C to stop.', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
