import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req, { params }) {

  await connectDB();

  const order = await Order.findOne({
    shopifyOrderId: params.id
  });

  return Response.json(order);

}