#!/usr/bin/env python3

"""
Simple HTTP Server for Facebook Ads Intelligence Dashboard
No dependencies required - uses only Python standard library
"""

import http.server
import socketserver
import os
import sys
import argparse
import webbrowser
import threading
import time
from pathlib import Path

# Configuration
DEFAULT_PORT = 8000
HOST = '0.0.0.0'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with CORS support and better logging"""
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(204)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging format"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"{timestamp} - {self.address_string()} - {format % args}")

def open_browser(port):
    """Open the default browser after a short delay"""
    time.sleep(1)
    webbrowser.open(f'http://localhost:{port}')

def main():
    """Main server function"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Start Facebook Ads Intelligence Dashboard server')
    parser.add_argument('--port', '-p', type=int, default=DEFAULT_PORT,
                        help=f'Port to run the server on (default: {DEFAULT_PORT})')
    parser.add_argument('--no-browser', '-n', action='store_true',
                        help='Do not open browser automatically')
    args = parser.parse_args()
    
    # Change to webapp directory
    webapp_dir = Path(__file__).parent
    os.chdir(webapp_dir)
    
    # Create server
    try:
        with socketserver.TCPServer((HOST, args.port), CustomHTTPRequestHandler) as httpd:
            print('\n🚀 Facebook Ads Intelligence Dashboard Server')
            print('=========================================')
            print(f'✅ Server running at: http://localhost:{args.port}')
            print(f'📂 Serving files from: {webapp_dir}')
            print('\n📍 Available URLs:')
            print(f'   Dashboard: http://localhost:{args.port}/')
            print(f'   Demo:      http://localhost:{args.port}/demo.html')
            print('\n💡 Press Ctrl+C to stop the server\n')
            
            # Open browser in a separate thread
            if not args.no_browser:
                browser_thread = threading.Thread(target=open_browser, args=(args.port,))
                browser_thread.daemon = True
                browser_thread.start()
            
            # Start serving
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f'❌ Port {args.port} is already in use.')
            print(f'   Try a different port: python server.py --port 8001')
        else:
            print(f'❌ Server error: {e}')
        sys.exit(1)
    except KeyboardInterrupt:
        print('\n👋 Shutting down server...')
        print('✅ Server stopped.')
        sys.exit(0)

if __name__ == '__main__':
    main()