#!/bin/sh
set -e

# Create data directory with proper permissions
mkdir -p /var/lib/postgresql/data
chown -R postgres:postgres /var/lib/postgresql/data
chmod 700 /var/lib/postgresql/data

# Create run directory
mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql

# Replace environment variables in patroni.yml
export PATRONI_NAME=${PATRONI_NAME:-patroni1}
envsubst < /etc/patroni.yml > /tmp/patroni.yml

# Start Patroni as postgres user
exec su-exec postgres patroni /tmp/patroni.yml
