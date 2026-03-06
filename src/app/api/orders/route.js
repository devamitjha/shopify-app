import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {

  try {

    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return Response.json(orders);

  } catch (error) {

    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );

  }

}