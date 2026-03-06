import { connectDB } from "@/lib/mongodb";
import WebhookLog from "@/models/WebhookLog";

export async function GET() {

  await connectDB();

  const logs = await WebhookLog
    .find()
    .sort({ createdAt: -1 })
    .limit(50);

  return Response.json(logs);

}