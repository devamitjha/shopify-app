import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "your_mongouri";

await mongoose.connect(MONGODB_URI);

const password = await bcrypt.hash("your_password", 10);

await mongoose.connection.collection("users").insertOne({
  username: "admin",
  password
});

console.log("Admin created");

process.exit();