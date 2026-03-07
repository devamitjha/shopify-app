import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { connectDB } from "../lib/mongodb.js";
import Order from "../models/Order.js";
import { generateToken } from "../lib/erpToken.js";
import { sendOrderToERP } from "../lib/erpOrder.js";

console.log("🚀 ERP Worker started...");

new Worker(

  "orderQueue",

  async job => {

    const { shopifyOrder, erpPayload } = job.data;

    await connectDB();

    console.log("Processing Order:", shopifyOrder.id);

    let status = "success";
    let response = null;

    try {

      const token = await generateToken();

      response = await sendOrderToERP(
        token,
        erpPayload
      );

    } catch (err) {

      status = "failed";

      response =
        err.response?.data ||
        err.message;

      console.error(
        "❌ ERP ERROR:",
        JSON.stringify(response, null, 2)
      );

    }

    await Order.updateOne(
      { shopifyOrderId: shopifyOrder.id },
      {
        status,
        erpResponse: response
      }
    );    

  },

  { connection: redis }

);