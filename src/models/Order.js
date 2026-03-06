import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({

  shopifyOrderId: {
    type: Number,
    unique: true
  },

  erpPayload: Object,
  shopifyPayload: Object,

  status: {
    type: String,
    default: "queued"
  },

  erpResponse: Object,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);