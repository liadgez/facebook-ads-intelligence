# Facebook Ads Intelligence - Web Dashboard

This is the web dashboard for visualizing and analyzing Facebook Ads data scraped by the intelligence platform.

## 🚀 Quick Start

### Option 1: Automatic Server Selection
```bash
./start-server.sh
```
This script automatically detects available runtimes and lets you choose.

### Option 2: Node.js Server
```bash
npm start
# or
node server.js
# Custom port:
PORT=3000 node server.js
```

### Option 3: Python Server
```bash
python3 server.py
# or
python server.py --port 8000
# Don't open browser:
python server.py --no-browser
```

### Option 4: Docker Container
```bash
# Start container
docker-compose up

# Run in background
docker-compose up -d

# Stop container
docker-compose down

# View logs
docker-compose logs -f
```

## 📍 Available URLs

Once the server is running, access:
- **Dashboard**: http://localhost:8080/ (or your chosen port)
- **Demo Mode**: http://localhost:8080/demo.html

## 🌐 Default Ports

- **Node.js**: 8080 (configurable via PORT env)
- **Python**: 8000 (configurable via --port)
- **Docker**: 8080 (mapped from container port 80)

## 📁 File Structure

```
webapp/
├── index.html          # Main dashboard
├── demo.html          # Demo with sample data
├── css/               # Styles
│   └── styles.css     # Custom CSS
├── js/                # JavaScript
│   ├── app.js         # Main application
│   ├── charts.js      # Chart configurations
│   └── analysis.js    # Analysis functions
├── data/              # Data files
│   └── sample.json    # Sample data for demo
├── server.js          # Node.js server
├── server.py          # Python server
├── start-server.sh    # Auto-detect server script
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose config
└── nginx.conf         # Nginx configuration
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=8081 node server.js
```

### Permission Denied (start-server.sh)
```bash
chmod +x start-server.sh
./start-server.sh
```

### Docker Issues
```bash
# Reset Docker
docker-compose down -v
docker-compose up --build

# Check logs
docker-compose logs
```

### CORS Errors
All servers include CORS headers by default. If you still see errors:
1. Check browser console for specific error
2. Ensure you're accessing via http://localhost (not file://)
3. Try a different browser or incognito mode

## 🚀 Production Deployment

### Using Docker (Recommended)
```bash
# Build production image
docker build -t facebook-ads-intelligence .

# Run container
docker run -d -p 80:80 --name fb-ads-dashboard facebook-ads-intelligence
```

### Using PM2 (Node.js)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name fb-ads-dashboard

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Using Nginx
1. Copy files to web root: `/var/www/html/`
2. Use the provided `nginx.conf` as reference
3. Enable site and reload Nginx

## 📊 Features

- **Upload JSON**: Drag & drop or click to upload scraped data
- **Real-time Filtering**: Search and filter ads instantly
- **Interactive Charts**: Emotional triggers and timeline analysis
- **Dark Mode**: Toggle between light and dark themes
- **Export Options**: Download data as JSON or CSV
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🔒 Security Notes

- Servers bind to 0.0.0.0 (all interfaces) by default
- For local-only access, modify to use 127.0.0.1
- No authentication is implemented - add if needed
- CORS is enabled for development convenience

## 📝 License

MIT License - see the main repository for details.