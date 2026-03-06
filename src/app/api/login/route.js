import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {

  await connectDB();

  const { username, password } = await req.json();

  const user = await User.findOne({ username });

  if (!user)
    return Response.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );

  const valid = await bcrypt.compare(password, user.password);

  if (!valid)
    return Response.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie": `session=${token}; Path=/; HttpOnly`
      }
    }
  );

}