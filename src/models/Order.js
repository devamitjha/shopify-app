import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  shopifyOrderId: Number,
  erpPayload: Object,
  shopifyPayload: Object,
  status: String,
  erpResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);