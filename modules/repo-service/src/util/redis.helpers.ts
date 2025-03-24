import { createClient, RedisClientType } from "redis";

let redisClient: any;

export function getOrCreateRedisClient() {
  if (!redisClient) {
    createClient({
      url: process.env.REDIS_URL,
    })
      .on("error", (err) => console.error("[REDIS ERROR]", err))
      .connect()
      .then((client) => {
        redisClient = client;
      });
  }
  return redisClient;
}
