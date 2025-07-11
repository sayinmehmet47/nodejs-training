import http from 'http';
import { URL } from 'url';

// Configuration
const LB_PORT = 3000;
const BACKEND_PORTS = [3001, 3002]; // Two backend instances
let currentIndex = 0;

// Health check function
const checkHealth = (port) => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/api/user',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 401); // 401 means server is up but not authenticated
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
};

// Get next healthy backend
const getNextBackend = async () => {
  const healthyBackends = [];
  
  for (const port of BACKEND_PORTS) {
    const isHealthy = await checkHealth(port);
    if (isHealthy) {
      healthyBackends.push(port);
    }
  }
  
  if (healthyBackends.length === 0) {
    throw new Error('No healthy backends available');
  }
  
  // Round-robin selection
  const selectedPort = healthyBackends[currentIndex % healthyBackends.length];
  currentIndex = (currentIndex + 1) % healthyBackends.length;
  
  return selectedPort;
};

// Create load balancer server
const server = http.createServer(async (req, res) => {
  try {
    const backendPort = await getNextBackend();
    
    // Parse the request URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Create request to backend
    const backendReq = http.request({
      hostname: 'localhost',
      port: backendPort,
      path: url.pathname + url.search,
      method: req.method,
      headers: {
        ...req.headers,
        'x-forwarded-for': req.socket.remoteAddress,
        'x-forwarded-proto': 'http',
        'x-forwarded-host': req.headers.host
      }
    }, (backendRes) => {
      // Forward response headers
      res.writeHead(backendRes.statusCode, backendRes.headers);
      
      // Pipe the response body
      backendRes.pipe(res);
    });

    // Handle backend request errors
    backendReq.on('error', (err) => {
      console.error(`Backend error (port ${backendPort}):`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend service unavailable' }));
    });

    // Pipe the request body to backend
    req.pipe(backendReq);

  } catch (error) {
    console.error('Load balancer error:', error.message);
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
  }
});

// Health check endpoint for the load balancer itself
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', backends: BACKEND_PORTS }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start servers
server.listen(LB_PORT, () => {
  console.log(`🚀 Load Balancer running on http://localhost:${LB_PORT}`);
  console.log(`📊 Backend instances: ${BACKEND_PORTS.join(', ')}`);
  console.log(`🔍 Health check: http://localhost:${LB_PORT}/health`);
});

healthServer.listen(LB_PORT + 1000, () => {
  console.log(`🏥 Health check server on http://localhost:${LB_PORT + 1000}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down load balancer...');
  server.close(() => {
    healthServer.close(() => {
      console.log('✅ Load balancer stopped');
      process.exit(0);
    });
  });
}); 