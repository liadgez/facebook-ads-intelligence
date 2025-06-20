#!/usr/bin/env node

/**
 * Simple HTTP Server for Facebook Ads Intelligence Dashboard
 * No dependencies required - uses only Node.js built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const ROOT_DIR = __dirname;

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'font/eot'
};

// Create server
const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    
    // Security: Prevent directory traversal
    pathname = pathname.replace(/\.\./g, '');
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construct file path
    const filePath = path.join(ROOT_DIR, pathname);
    
    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 Not Found</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; }
                        h1 { color: #333; }
                        a { color: #2563eb; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested file "${pathname}" was not found.</p>
                    <p><a href="/">Go to Dashboard</a></p>
                </body>
                </html>
            `);
            return;
        }
        
        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Set CORS headers for API compatibility
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle OPTIONS request
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        
        // Read and serve file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
                console.error(`Error reading file ${filePath}:`, err);
                return;
            }
            
            // Set content type and cache headers
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            
            res.end(content);
            
            // Log request
            const timestamp = new Date().toISOString();
            console.log(`${timestamp} - ${req.method} ${pathname} - 200`);
        });
    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log('\n🚀 Facebook Ads Intelligence Dashboard Server');
    console.log('=========================================');
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`📂 Serving files from: ${ROOT_DIR}`);
    console.log('\n📍 Available URLs:');
    console.log(`   Dashboard: http://localhost:${PORT}/`);
    console.log(`   Demo:      http://localhost:${PORT}/demo.html`);
    console.log('\n💡 Press Ctrl+C to stop the server\n');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error('   Try a different port: PORT=8081 node server.js');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});