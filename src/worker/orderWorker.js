import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local")
});

console.log("MONGO URI:", process.env.MONGODB_URI);

import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { generateToken } from "../lib/erpToken.js";
import { sendOrderToERP } from "../lib/erpOrder.js";
import { connectDB } from "../lib/mongodb.js";
import Order from "../models/Order.js";

console.log("🚀 ERP Worker started...");

const worker = new Worker(
  "orderQueue",
  async job => {

    console.log("📦 Job received:", job.id);

    const { shopifyOrder, erpPayload } = job.data;

    await connectDB();

    console.log("Processing Order:", shopifyOrder.id);

    const existing = await Order.findOne({
      shopifyOrderId: shopifyOrder.id
    });

    if (existing) {
      console.log("⚠️ Order already processed:", shopifyOrder.id);
      return;
    }

    let status = "success";
    let response = null;

    try {

      const token = await generateToken();

      response = await sendOrderToERP(token, erpPayload);

      console.log("✅ ERP RESPONSE:");
      console.log(JSON.stringify(response, null, 2));

    } catch (err) {

      status = "failed";

      response = err.response?.data || err.message;

      console.error("❌ ERP ERROR:", JSON.stringify(response, null, 2));

    }

    await Order.create({
      shopifyOrderId: shopifyOrder.id,
      erpPayload,
      shopifyPayload: shopifyOrder,
      status,
      erpResponse: response
    });

    console.log("✅ Order stored in MongoDB");

  },
  {
    connection: redis
  }
);

/* Worker event listeners */

worker.on("completed", job => {
  console.log(`🎉 Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

worker.on("error", err => {
  console.error("Worker error:", err);
});