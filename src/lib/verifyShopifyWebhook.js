import crypto from "crypto";

export function verifyShopifyWebhook(rawBody, hmacHeader) {

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return hash === hmacHeader;
}