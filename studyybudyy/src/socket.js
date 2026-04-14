import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  // Check if we already have an active connection to avoid duplicates
  if (!socket || !socket.connected) {
    
    // 📍 HERE IS YOUR CONFIGURATION OBJECT
    socket = io("http://localhost:5000", {
      transports: ["polling", "websocket"], // Forces WebSocket only (no polling)
      reconnection: true,        // Allows automatic reconnection if dropped mid-stream
      reconnectionAttempts: 10,  // Number of times to try reconnecting
      reconnectionDelay: 1000,   // Wait 1s between attempts
      timeout: 20000,            // 20s connection timeout
      forceNew: true,            // Ensures a fresh session for each "Send" action
    });

    // Logging for your debugging
    socket.on("connect" ,() => console.log("✅ Socket Connected:", socket.id));
    
    socket.on("connect_error", (err) => {
      console.error("⚠️ Connection Error:", err.message);
    });
  }
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🛑 Socket disconnected and cleared.");
  }
};