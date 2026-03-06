import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {

  await connectDB();

  const orders = await Order
    .find()
    .sort({ createdAt: -1 });

  return Response.json(orders);

}