import { connectDB } from "@/lib/mongodb";
import { orderQueue } from "@/lib/orderQueue";
import Order from "@/models/Order";

export async function POST(req) {

  const { orderId } = await req.json();

  await connectDB();

  const order = await Order.findOne({
    shopifyOrderId: orderId
  });

  await orderQueue.add(
    "sendOrder",
    {
      shopifyOrder: order.shopifyPayload,
      erpPayload: order.erpPayload
    }
  );

  return Response.json({
    message: "Retry added to queue"
  });

}