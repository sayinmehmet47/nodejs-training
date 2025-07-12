# Redis Session Management for Cluster

This document explains how Redis is used for session management in the clustered Node.js application.

## Problem Solved

In a clustered environment, each Node.js process has its own memory space. When sessions are stored in memory (using `Map`), sessions created on one node are not available on other nodes. This causes authentication issues when requests are load-balanced across different nodes.

## Solution: Redis Session Storage

Redis is used as a centralized session store that all nodes can access, ensuring session consistency across the cluster.

## Implementation

### 1. Redis Session Manager (`utils/redis-session.ts`)

- **Connection Management**: Handles Redis client initialization and connection
- **Session Operations**:
  - `setSession()`: Store session with TTL
  - `getSession()`: Retrieve session data
  - `deleteSession()`: Remove session
  - `getUserFromSession()`: Get user data from session cookie

### 2. Updated Authentication Routes (`routes/auth.routes.ts`)

- **Login**: Stores session token in Redis instead of memory
- **Logout**: Removes session from Redis
- **Async Operations**: All session operations are now async

### 3. Updated API Routes (`routes/api.routes.ts`)

- **User Endpoint**: Uses Redis to retrieve user session data
- **Async Session Lookup**: Updated to handle async session retrieval

### 4. Server Initialization

Both `server.ts` and `server-cluster.ts` now:

- Initialize Redis connection on startup
- Handle graceful shutdown with Redis cleanup
- Provide proper error handling for Redis connection failures

## Configuration

### Redis Connection

- **URL**: `redis://localhost:6379` (default)
- **TTL**: 3600 seconds (1 hour) for sessions
- **Key Prefix**: `session:` for all session keys

### Environment Variables

- `REDIS_URL`: Override Redis connection URL (optional)

## Usage

### Starting the Application

```bash
# Single server
npm run single

# Cluster mode
npm run cluster

# With load balancer
npm run lb
```

### Session Flow

1. **Login**: User credentials validated → Session token generated → Stored in Redis with TTL
2. **Request**: Session token extracted from cookie → Looked up in Redis → User data retrieved
3. **Logout**: Session token removed from Redis → Cookie cleared

## Benefits

- ✅ **Cluster Compatibility**: Sessions work across all nodes
- ✅ **Scalability**: Redis can handle high session volumes
- ✅ **Persistence**: Sessions survive server restarts
- ✅ **TTL Support**: Automatic session expiration
- ✅ **Performance**: Fast Redis operations

## Monitoring

### Redis Commands for Debugging

```bash
# Connect to Redis CLI
redis-cli

# List all session keys
KEYS session:*

# Get session data
GET session:<token>

# Check session TTL
TTL session:<token>

# Monitor Redis operations
MONITOR
```

### Logs

The application logs Redis connection status:

- ✅ Success: "Redis connected successfully"
- ❌ Error: "Failed to connect to Redis"

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   - Ensure Redis is running: `docker ps | grep redis`
   - Check Redis port: `netstat -an | grep 6379`

2. **Session Not Found**

   - Verify session token in browser cookies
   - Check Redis for session key: `GET session:<token>`
   - Confirm TTL hasn't expired: `TTL session:<token>`

3. **Performance Issues**
   - Monitor Redis memory usage
   - Check for session leaks (old sessions not cleaned up)
   - Consider Redis clustering for high load

## Security Considerations

- Sessions are stored with TTL (automatic expiration)
- Session tokens are cryptographically random
- Redis connection uses localhost (internal network)
- Consider Redis authentication for production
- Implement session rotation for sensitive applications
