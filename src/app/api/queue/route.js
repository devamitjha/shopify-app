import { orderQueue } from "@/lib/orderQueue";

export async function GET() {

  const waiting = await orderQueue.getWaiting();
  const active = await orderQueue.getActive();
  const failed = await orderQueue.getFailed();
  const completed = await orderQueue.getCompleted();

  return Response.json({
    waiting: waiting.length,
    active: active.length,
    failed: failed.length,
    completed: completed.length
  });

}