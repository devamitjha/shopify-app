import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const orderQueue = new Queue("orderQueue", {
  connection: redis,

  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000
    },

    removeOnComplete: 100, // keep last 100 successful jobs
    removeOnFail: 500      // keep last 500 failed jobs
  }
});