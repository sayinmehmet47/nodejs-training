import pg from "pg";
const { Pool } = pg;

/**
 * ShardManager - Routes queries to the correct database shard
 *
 * This implements hash-based sharding where:
 * - We have N shards (database instances)
 * - Each record's shard is determined by: shardKey % numberOfShards
 * - All related data (user + their orders) lives on the same shard
 */
class ShardManager {
  constructor(shardConfigs) {
    this.shards = new Map();
    this.numberOfShards = shardConfigs.length;

    // Create connection pool for each shard
    shardConfigs.forEach((config, index) => {
      this.shards.set(
        index,
        new Pool({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          password: config.password,
          max: 10, // max connections per shard
        }),
      );
      console.log(`Shard ${index} connected at port ${config.port}`);
    });
  }

  /**
   * Determine which shard a key belongs to using modulo hashing
   * Simple but effective for evenly distributed numeric IDs
   */
  getShardIndex(shardKey) {
    // For numeric keys, use modulo directly
    // For string keys, you'd hash first (e.g., using murmur3)
    const index = Math.abs(Number(shardKey)) % this.numberOfShards;
    console.log(`Key ${shardKey} -> Shard ${index}`);
    return index;
  }

  /**
   * Get the connection pool for a specific shard
   */
  getShard(shardKey) {
    const shardIndex = this.getShardIndex(shardKey);
    return this.shards.get(shardIndex);
  }

  /**
   * Execute a query on the appropriate shard
   */
  async query(shardKey, sql, params = []) {
    const pool = this.getShard(shardKey);
    return pool.query(sql, params);
  }

  /**
   * Execute a query on ALL shards (scatter-gather pattern)
   * Use sparingly - this defeats the purpose of sharding!
   */
  async queryAllShards(sql, params = []) {
    const promises = [];
    for (const [index, pool] of this.shards) {
      promises.push(
        pool.query(sql, params).then((result) => ({
          shardIndex: index,
          rows: result.rows,
          rowCount: result.rowCount,
        })),
      );
    }
    return Promise.all(promises);
  }

  /**
   * Close all connections
   */
  async close() {
    for (const [index, pool] of this.shards) {
      await pool.end();
      console.log(`Shard ${index} disconnected`);
    }
  }
}

// Configuration for our 3 local shards
export const shardConfigs = [
  {
    host: "localhost",
    port: 5433,
    database: "shard_db",
    user: "postgres",
    password: "postgres",
  },
  {
    host: "localhost",
    port: 5434,
    database: "shard_db",
    user: "postgres",
    password: "postgres",
  },
  {
    host: "localhost",
    port: 5435,
    database: "shard_db",
    user: "postgres",
    password: "postgres",
  },
];

export default ShardManager;
