# PostgreSQL High Availability with Patroni + HAProxy

A production-ready PostgreSQL HA setup with automatic failover using Patroni and HAProxy.

## Architecture

```
                    ┌─────────────┐
                    │   HAProxy   │
                    │  :5432 (RW) │
                    │  :5433 (RO) │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼─────┐
       │  Patroni1   │          │  Patroni2   │
       │  (Primary)  │◄────────►│  (Replica)  │
       │   :5440     │ Streaming│   :5441     │
       └──────┬──────┘ Replication ─────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │    etcd     │
                    │   :2379     │
                    └─────────────┘
```

## Components

| Service | Port | Description |
|---------|------|-------------|
| HAProxy | 5432 | Primary connection (read-write) |
| HAProxy | 5433 | Replica connection (read-only) |
| HAProxy | 7000 | Stats dashboard |
| Patroni1 | 5440 | PostgreSQL node 1 |
| Patroni2 | 5441 | PostgreSQL node 2 |
| etcd | 2379 | Distributed configuration store |

## Quick Start

```bash
# Start the cluster
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Connection

### Through HAProxy (Recommended)

```bash
# Connect to primary (read-write)
psql -h localhost -p 5432 -U postgres

# Connect to replica (read-only)
psql -h localhost -p 5433 -U postgres
```

**Credentials:**
- Username: `postgres`
- Password: `postgres`

### Direct Connection

```bash
# Patroni1
psql -h localhost -p 5440 -U postgres

# Patroni2
psql -h localhost -p 5441 -U postgres
```

## Monitoring

### HAProxy Stats

Open http://localhost:7000 in your browser to see:
- Backend server status
- Connection statistics
- Health check results

### Patroni Status

```bash
# Check cluster status via REST API
curl -s http://localhost:8008 | jq

# Check if node is primary
curl -s http://localhost:8008/primary

# Check if node is replica
curl -s http://localhost:8008/replica
```

### Cluster Status

```bash
# View patroni logs
docker logs patroni1
docker logs patroni2

# Check replication status (run on primary)
docker exec patroni1 psql -U postgres -c "SELECT * FROM pg_stat_replication;"
```

## Automatic Failover

Patroni automatically handles failover when the primary fails:

1. etcd detects the primary is unresponsive
2. Patroni promotes the replica to primary
3. HAProxy routes traffic to the new primary

### Test Failover

```bash
# Stop the current primary
docker stop patroni1

# Watch the logs - patroni2 will be promoted
docker logs -f patroni2

# Verify connection still works
psql -h localhost -p 5432 -U postgres -c "SELECT pg_is_in_recovery();"
# Result: f (false = primary)

# Restart patroni1 - it will rejoin as replica
docker start patroni1
```

## Configuration

### Patroni Settings

Edit `patroni/patroni.yml`:

```yaml
bootstrap:
  dcs:
    ttl: 30                    # Leader lock TTL
    loop_wait: 10              # Interval between checks
    retry_timeout: 10          # Timeout for DCS operations
    maximum_lag_on_failover: 1048576  # Max lag (bytes) for failover
```

### HAProxy Settings

Edit `haproxy.cfg`:

```
listen postgres_primary
    bind *:5432
    option httpchk GET /primary    # Health check endpoint
    default-server inter 3s fall 3 rise 2
```

## Scaling

### Add More Replicas

1. Add new service in `docker-compose.yml`:

```yaml
patroni3:
  build: ./patroni
  container_name: patroni3
  environment:
    PATRONI_NAME: patroni3
  ports:
    - "5442:5432"
    - "8010:8008"
  volumes:
    - patroni3_data:/var/lib/postgresql/data
  networks:
    - ha-network
  depends_on:
    etcd:
      condition: service_healthy
```

2. Add to HAProxy:

```
server patroni3 patroni3:5432 check port 8008
```

3. Restart:

```bash
docker compose up -d
```

## Backup & Recovery

### Create Backup

```bash
# Backup from primary via HAProxy
pg_dump -h localhost -p 5432 -U postgres -d mydb > backup.sql

# Or use pg_basebackup for full backup
pg_basebackup -h localhost -p 5432 -U postgres -D /backup -Fp -Xs -P
```

### Restore

```bash
psql -h localhost -p 5432 -U postgres -d mydb < backup.sql
```

## Troubleshooting

### Check etcd

```bash
docker exec etcd etcdctl endpoint health
docker exec etcd etcdctl get --prefix /service/mydb
```

### Check Patroni

```bash
# REST API status
curl -s http://localhost:8008 | jq

# Logs
docker logs patroni1 --tail 50
```

### Common Issues

**"No primary found"**
- Check etcd is healthy
- Verify network connectivity between containers

**"Replication lag too high"**
- Check network bandwidth
- Increase `maximum_lag_on_failover` if needed

**"Connection refused on 5432"**
- Ensure HAProxy is running
- Check backend health in HAProxy stats

## Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove volumes (data)
docker compose down -v
```
