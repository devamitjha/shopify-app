import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  console.log("✅ WebSocket server started");

};

export const getIO = () => {

  if (!io) {
    throw new Error("Socket not initialized");
  }

  return io;

};