import { generateToken } from "@/lib/erpToken";
import { sendOrderToERP } from "@/lib/erpOrder";

export async function POST(req) {

  try {

    const { payload } = await req.json();

    if (!payload) {
      return Response.json(
        { error: "Payload missing" },
        { status: 400 }
      );
    }

    const token = await generateToken();

    const response = await sendOrderToERP(token, payload);

    return Response.json({
      status: "success",
      response
    });

  } catch (error) {

    return Response.json({
      status: "failed",
      error: error.response?.data || error.message
    });

  }

}