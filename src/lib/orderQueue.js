import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const orderQueue = new Queue("orderQueue", {
  connection: redis
});