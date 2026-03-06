import { Server } from "socket.io";

export async function GET(req) {

  if (!global.io) {

    console.log("Starting Socket.IO server...");

    global.io = new Server({
      path: "/api/socket",
      cors: {
        origin: "*"
      }
    });

  }

  return new Response("Socket running");

}