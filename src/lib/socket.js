import { Server } from "socket.io";

let io;

export const initIO = (server) => {

  if (!io) {

    io = new Server(server, {
      path: "/api/socket",
      cors: {
        origin: "*"
      }
    });

    console.log("✅ Socket.IO initialized");

  }

  return io;

};

export const getIO = () => {

  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;

};