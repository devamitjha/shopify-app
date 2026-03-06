import { connectDB } from "@/lib/mongodb";
import { buildMarketplacePayload } from "@/lib/buildMarketplacePayload";
import { orderQueue } from "@/lib/orderQueue";
import Order from "@/models/Order";
import WebhookLog from "@/models/WebhookLog";

export async function POST(req) {

  const body = await req.json();

  await connectDB();

  await WebhookLog.create({
    topic: "orders/create",
    payload: body,
    status: "received"
  });

  const erpPayload = buildMarketplacePayload(body);

  const existing = await Order.findOne({
    shopifyOrderId: body.id
  });

  if (!existing) {

    await Order.create({
      shopifyOrderId: body.id,
      erpPayload,
      shopifyPayload: body,
      status: "queued"
    });

  }

  await orderQueue.add(
    "sendOrder",
    { shopifyOrder: body, erpPayload },
    {
      jobId: `order-${body.id}`,
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 }
    }
  );

  return Response.json({
    message: "Order added to queue"
  });

}