import { verifyShopifyWebhook } from "@/lib/verifyShopifyWebhook";
import { orderQueue } from "@/lib/orderQueue";
import { buildMarketplacePayload } from "@/lib/buildMarketplacePayload";

export async function POST(req) {

  const rawBody = await req.text();

  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

  let isValid = true;

  if (process.env.NODE_ENV === "production") {
    isValid = verifyShopifyWebhook(rawBody, hmacHeader);
  }

  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const shopifyOrder = JSON.parse(rawBody);

  const erpPayload = buildMarketplacePayload(shopifyOrder);

  console.log("ERP PAYLOAD:");
  console.log(JSON.stringify(erpPayload, null, 2));

  const job = await orderQueue.add(
    "sendOrder",
    {
      shopifyOrder,
      erpPayload
    },
    {
      jobId: `order-${shopifyOrder.id}`,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5000
      }
    }
  );

  console.log("JOB ADDED:", job.id);

  return Response.json({
    message: "Order added to queue"
  });

}