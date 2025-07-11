import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BACKEND_PORTS = [3001, 3002];
const LB_PORT = 3000;

console.log('🚀 Starting Poster App Cluster...\n');

// Start backend instances
const backendProcesses = BACKEND_PORTS.map(port => {
  console.log(`📡 Starting backend instance on port ${port}...`);
  
  // use nodemon to start the backend
  const backendProcess = spawn('nodemon', ['--exec', 'ts-node', '--esm', 'server-cluster.ts', port.toString()], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT: port.toString() }
  });

  backendProcess.on('error', (error) => {
    console.error(`❌ Failed to start backend on port ${port}:`, error.message);
  });

  backendProcess.on('exit', (code) => {
    console.log(`🛑 Backend on port ${port} exited with code ${code}`);
  });

  return backendProcess;
});

// Wait a bit for backends to start
setTimeout(() => {
  console.log('\n⚖️  Starting load balancer...');
  
  const lbProcess = spawn('node', ['loadbalancer.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  lbProcess.on('error', (error) => {
    console.error('❌ Failed to start load balancer:', error.message);
  });

  lbProcess.on('exit', (code) => {
    console.log(`🛑 Load balancer exited with code ${code}`);
  });

  // Handle cluster shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down cluster...');
    
    // Kill all processes
    backendProcesses.forEach(backendProcess => {
      backendProcess.kill('SIGINT');
    });
    
    lbProcess.kill('SIGINT');
    
    setTimeout(() => {
      console.log('✅ Cluster shutdown complete');
      process.exit(0);
    }, 1000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

}, 2000);

console.log('\n📋 Cluster Configuration:');
console.log(`   Load Balancer: http://localhost:${LB_PORT}`);
console.log(`   Backend Instances: ${BACKEND_PORTS.join(', ')}`);
console.log(`   Health Check: http://localhost:${LB_PORT + 1000}/health`);
console.log('\n⏹️  Press Ctrl+C to stop the cluster\n'); 