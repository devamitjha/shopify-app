import { initIO } from "@/lib/socket";

export async function GET(req) {

  if (!global.io) {

    global.io = initIO();

  }

  return new Response("Socket ready");

}