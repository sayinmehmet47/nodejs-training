import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  host: "localhost",
  port: 5442,
  database: "myapp",
  user: "postgres",
  password: "postgres",
  max: 10,
};

const pool = new Pool(poolConfig);

async function main(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (let i = 1; i <= 5; i++) {
      await pool.query("INSERT INTO messages (content) VALUES ($1)", [
        `Message ${i} at ${new Date().toISOString()}`,
      ]);
    }

    const handlers = await Promise.all(
      Array.from({ length: 5 }).map(async (_, idx) => {
        const client = await pool.connect();
        try {
          const serverInfo = await client.query(
            "SELECT inet_server_addr() as server, inet_server_port() as port",
          );
          const { server, port } = serverInfo.rows[0];
          return { idx, server, port };
        } finally {
          client.release();
        }
      }),
    );

    handlers
      .sort((a, b) => a.idx - b.idx)
      .forEach(({ idx, server, port }) => {
        console.log(`  Query ${idx + 1}: Handled by ${server}:${port}`);
      });
  } catch (error) {
    const err = error as Error;
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
