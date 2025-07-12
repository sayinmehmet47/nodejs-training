import { createClient } from 'redis';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testSessionSharing() {
  console.log('🧪 Testing Redis Session Sharing Across Processes\n');

  // Start two server instances
  console.log('🚀 Starting server instances...');
  
  const server1 = spawn('node', ['--loader', 'ts-node/esm', 'server-cluster.ts', '3001'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: { ...process.env, PORT: '3001' }
  });

  const server2 = spawn('node', ['--loader', 'ts-node/esm', 'server-cluster.ts', '3002'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: { ...process.env, PORT: '3002' }
  });

  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('✅ Servers started\n');

  // Test login on server 1
  console.log('🔐 Testing login on server 1 (port 3001)...');
  const loginResponse = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'john', password: 'password123' })
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed on server 1');
    return;
  }

  const loginData = await loginResponse.json();
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('✅ Login successful on server 1');
  console.log(`   User: ${loginData.user.username}`);
  console.log(`   Session: ${cookies}\n`);

  // Test user endpoint on server 1 (should work)
  console.log('👤 Testing user endpoint on server 1...');
  const userResponse1 = await fetch('http://localhost:3001/api/user', {
    headers: { 'Cookie': cookies }
  });

  if (userResponse1.ok) {
    const userData = await userResponse1.json();
    console.log('✅ User endpoint works on server 1');
    console.log(`   User: ${userData.username}\n`);
  } else {
    console.log('❌ User endpoint failed on server 1\n');
  }

  // Test user endpoint on server 2 (should also work with Redis)
  console.log('👤 Testing user endpoint on server 2 (port 3002)...');
  const userResponse2 = await fetch('http://localhost:3002/api/user', {
    headers: { 'Cookie': cookies }
  });

  if (userResponse2.ok) {
    const userData = await userResponse2.json();
    console.log('✅ User endpoint works on server 2 (Redis session sharing!)');
    console.log(`   User: ${userData.username}\n`);
  } else {
    console.log('❌ User endpoint failed on server 2\n');
  }

  // Test logout
  console.log('🚪 Testing logout...');
  const logoutResponse = await fetch('http://localhost:3001/api/logout', {
    method: 'DELETE',
    headers: { 'Cookie': cookies }
  });

  if (logoutResponse.ok) {
    console.log('✅ Logout successful\n');
  } else {
    console.log('❌ Logout failed\n');
  }

  // Verify session is removed from both servers
  console.log('🔍 Verifying session removal...');
  const userResponse3 = await fetch('http://localhost:3001/api/user', {
    headers: { 'Cookie': cookies }
  });

  if (!userResponse3.ok) {
    console.log('✅ Session properly removed from server 1');
  } else {
    console.log('❌ Session still exists on server 1');
  }

  const userResponse4 = await fetch('http://localhost:3002/api/user', {
    headers: { 'Cookie': cookies }
  });

  if (!userResponse4.ok) {
    console.log('✅ Session properly removed from server 2');
  } else {
    console.log('❌ Session still exists on server 2');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  server1.kill('SIGINT');
  server2.kill('SIGINT');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('✅ Test complete!');
}

testSessionSharing().catch(console.error); 