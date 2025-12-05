import { Pool, QueryResult } from "pg";

/**
 * Configuration for a single database shard
 */
export interface ShardConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Result from a scatter-gather query across all shards
 */
export interface ShardQueryResult<T = Record<string, unknown>> {
  shardIndex: number;
  rows: T[];
  rowCount: number | null;
}

/**
 * ShardManager - Routes queries to the correct database shard
 *
 * This implements hash-based sharding where:
 * - We have N shards (database instances)
 * - Each record's shard is determined by: shardKey % numberOfShards
 * - All related data (user + their orders) lives on the same shard
 */
class ShardManager {
  private shards: Map<number, Pool>;
  private numberOfShards: number;

  constructor(shardConfigs: ShardConfig[]) {
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
        })
      );
      console.log(`Shard ${index} connected at port ${config.port}`);
    });
  }

  /**
   * Determine which shard a key belongs to using modulo hashing
   * Simple but effective for evenly distributed numeric IDs
   */
  getShardIndex(shardKey: number | string): number {
    // For numeric keys, use modulo directly
    // For string keys, you'd hash first (e.g., using murmur3)
    const index = Math.abs(Number(shardKey)) % this.numberOfShards;
    console.log(`Key ${shardKey} -> Shard ${index}`);
    return index;
  }

  /**
   * Get the connection pool for a specific shard
   */
  getShard(shardKey: number | string): Pool {
    const shardIndex = this.getShardIndex(shardKey);
    const pool = this.shards.get(shardIndex);
    if (!pool) {
      throw new Error(`Shard ${shardIndex} not found`);
    }
    return pool;
  }

  /**
   * Execute a query on the appropriate shard
   */
  async query<T = Record<string, unknown>>(
    shardKey: number | string,
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    const pool = this.getShard(shardKey);
    return pool.query<T>(sql, params);
  }

  /**
   * Execute a query on ALL shards (scatter-gather pattern)
   * Use sparingly - this defeats the purpose of sharding!
   */
  async queryAllShards<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<ShardQueryResult<T>[]> {
    const promises: Promise<ShardQueryResult<T>>[] = [];

    for (const [index, pool] of this.shards) {
      promises.push(
        pool.query<T>(sql, params).then((result) => ({
          shardIndex: index,
          rows: result.rows,
          rowCount: result.rowCount,
        }))
      );
    }

    return Promise.all(promises);
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    for (const [index, pool] of this.shards) {
      await pool.end();
      console.log(`Shard ${index} disconnected`);
    }
  }
}

// Configuration for our 3 local shards
export const shardConfigs: ShardConfig[] = [
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
