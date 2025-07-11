# Poster App Load Balancer Setup

This setup provides a simple load balancer that distributes traffic across multiple backend instances of the Poster app.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Backend Node 1 │    │  Backend Node 2 │
│   Port: 3000    │───▶│   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Start the entire cluster (recommended)

```bash
npm run cluster
```

This will start:

- Load balancer on port 3000
- Backend instance 1 on port 3001
- Backend instance 2 on port 3002

### Manual startup

1. **Start backend instances:**

   ```bash
   # Terminal 1
   npm run backend 3001

   # Terminal 2
   npm run backend 3002
   ```

2. **Start load balancer:**
   ```bash
   # Terminal 3
   npm run lb
   ```

## 📊 Load Balancer Features

### ✅ Round-Robin Distribution

- Requests are distributed evenly across healthy backends
- Automatic failover if a backend becomes unhealthy

### ✅ Health Checks

- Load balancer checks backend health every request
- Unhealthy backends are automatically excluded
- Health check endpoint: `http://localhost:4000/health`

### ✅ Request Forwarding

- Preserves all HTTP headers
- Adds forwarding headers (`x-forwarded-for`, `x-forwarded-proto`, etc.)
- Handles all HTTP methods (GET, POST, DELETE, etc.)

### ✅ Error Handling

- Graceful handling of backend failures
- Returns appropriate error responses
- Automatic retry with healthy backends

## 🔧 Configuration

### Load Balancer Settings (`loadbalancer.js`)

```javascript
const LB_PORT = 3000; // Load balancer port
const BACKEND_PORTS = [3001, 3002]; // Backend ports
```

### Backend Settings (`server-cluster.ts`)

```typescript
const PORT = process.env.PORT || process.argv[2] || 3001;
```

## 📡 API Endpoints

### Load Balancer (Port 3000)

- `GET /` - Main application
- `GET /api/user` - User data (load balanced)
- `POST /api/login` - Login (load balanced)
- `DELETE /api/logout` - Logout (load balanced)
- `GET /api/posts` - Posts (load balanced)
- `POST /api/posts` - Create post (load balanced)

### Health Check (Port 4000)

- `GET /health` - Load balancer health status

## 🧪 Testing

### Test load balancing

```bash
# Make multiple requests to see distribution
for i in {1..10}; do
  curl http://localhost:3000/api/user
  echo "Request $i"
done
```

### Test health check

```bash
curl http://localhost:4000/health
```

### Test individual backends

```bash
curl http://localhost:3001/api/user
curl http://localhost:3002/api/user
```

## 🛑 Shutdown

### Graceful shutdown

```bash
# Press Ctrl+C in the cluster terminal
# Or kill the processes
pkill -f "node.*loadbalancer"
pkill -f "node.*server-cluster"
```

## 🔍 Monitoring

### Logs

- Each backend instance logs its port and process ID
- Load balancer logs backend selection and errors
- Health check failures are logged

### Performance

- Round-robin distribution ensures even load
- Health checks prevent traffic to failed backends
- Automatic failover maintains service availability

## 🚨 Important Notes

1. **Session State**: Sessions are stored in memory, so they're not shared between backends
2. **Data Consistency**: Each backend has its own data (posts, users)
3. **Development Only**: This is a simple load balancer for development/testing
4. **Production**: Use proper load balancers like nginx, HAProxy, or cloud load balancers

## 🔧 Troubleshooting

### Backend not responding

- Check if backend is running on correct port
- Verify health check endpoint is accessible
- Check logs for errors

### Load balancer errors

- Ensure all backends are healthy
- Check port availability
- Verify network connectivity

### Session issues

- Sessions are not shared between backends
- Login on one backend won't work on another
- Consider using Redis or database for session storage
