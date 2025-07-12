import { createClient } from "redis";
import type { RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: "redis://localhost:6379",
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error(
      "Redis client not initialized. Call initializeRedis() first."
    );
  }
  return redisClient;
};

export const setSession = async (
  sessionToken: string,
  userId: number,
  ttlSeconds: number = 3600
): Promise<void> => {
  const client = getRedisClient();
  await client.setEx(`session:${sessionToken}`, ttlSeconds, userId.toString());
};

export const getSession = async (
  sessionToken: string
): Promise<number | null> => {
  const client = getRedisClient();
  const userId = await client.get(`session:${sessionToken}`);
  return userId ? parseInt(userId, 10) : null;
};

export const deleteSession = async (sessionToken: string): Promise<void> => {
  const client = getRedisClient();
  await client.del(`session:${sessionToken}`);
};

export const getUserFromSession = async (
  cookies: string | undefined
): Promise<any> => {
  if (!cookies) return null;

  const sessionMatch = cookies.match(/session=([^;]+)/);
  if (!sessionMatch) return null;

  const sessionToken = sessionMatch[1];
  const userId = await getSession(sessionToken);

  if (!userId) return null;

  const { users } = await import("./session.ts");
  return users.find((u: any) => u.id === userId) || null;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
