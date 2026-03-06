import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://techamitjha:Amitjha%403921@cluster0.qfuwl84.mongodb.net/shopify-app";

await mongoose.connect(MONGODB_URI);

const password = await bcrypt.hash("admin@2025", 10);

await mongoose.connection.collection("users").insertOne({
  username: "admin",
  password
});

console.log("Admin created");

process.exit();