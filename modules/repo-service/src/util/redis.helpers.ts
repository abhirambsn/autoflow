import { createClient } from "redis";

let redisClient: any;

const getRedisCredentials = (): string => {
  if (process.env.NODE_ENV === 'production') {
      const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
      const redisCreds = vcapServices['redis-cache'][0]?.credentials;
      if (!redisCreds) throw new Error('Redis credentials not found');
      return redisCreds?.uri
  }
  return "redis://localhost:6379";
}

export async function getOrCreateRedisClient() {
  if (!redisClient) {
    const redisUrl = getRedisCredentials();
    redisClient = createClient({url: redisUrl});
    redisClient.on("error", (err: any) => console.error("[REDIS ERROR]", err));
    redisClient.on("connect", () => console.log("[REDIS] Connected"));
    redisClient.on("ready", () => console.log("[REDIS] Ready"));
    redisClient.on("end", () => console.log("[REDIS] Disconnected"));
    await redisClient.connect();
  }
  return redisClient;
}
