import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import { saveMessage, getAllMessages } from "./src/utils/messageService.js";
import { sessionMiddleware } from "./src/sessions/sessionStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


// Middleware

app.use(express.json());

// Session middleware (Redis)
app.use(sessionMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));


// Routes


// Save username into session 
app.post("/set-username", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  req.session.username = username;
  res.sendStatus(200);
});


// Share session with Socket.IO

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


// Socket.IO Logic

io.on("connection", async (socket) => {
  console.log(` Socket connected: ${socket.id}`);

  // Join chat room
  
  socket.on("join_room", async ({ room, username }) => {
  socket.username = username;
  socket.join(room);

  const messages = await getAllMessages(room);
  socket.emit("chat_history", messages);


    // Notify others (system message)
    socket.to(room).emit("receive_message", {
      username: "SYSTEM",
      message: "A user joined the room",
      room,
      timestamp: new Date().toISOString(),
    });
  });

  // Receive and broadcast message
  socket.on("send_message", async ({ room, message, username }) => {
      console.log("SERVER RECEIVED:", { room, message, username });

    if (!room || !message) return;

    const msgData = {
      // username: username || "Anonymous",
      username: username || socket.username || "Anonymous",
      message,
      room,
      timestamp: new Date().toISOString(),
    };

    // Save to Redis
    await saveMessage(msgData, room);

    // Broadcast to room
    io.to(room).emit("receive_message", msgData);
  });

  // Typing indicator
  socket.on("typing", (room) => {
    socket.to(room).emit("typing");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(` Socket disconnected: ${socket.id}`);
  });
});


// Start Server

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
