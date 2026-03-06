import mongoose from "mongoose";

const WebhookLogSchema = new mongoose.Schema({

  topic: String,
  shop: String,

  payload: Object,

  status: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.models.WebhookLog ||
  mongoose.model("WebhookLog", WebhookLogSchema);