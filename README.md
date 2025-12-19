
# Real-Time Chat Application

## Overview

This is a **real-time chat application** built with **Node.js**, **Express**, **Socket.IO**, and **Redis**. The application allows multiple users to chat in real-time across different browser tabs or devices. Chat messages are stored in **Redis** so that chat history persists even if a user reloads the page or opens a new tab.

---

## Features

- Real-time messaging using **Socket.IO**.
- Persistent chat history stored in **Redis**.
- Multiple chat rooms (default room: `global`).
- User session management with **Express sessions** stored in Redis.
- Auto-scroll to the latest message.
- System messages for users joining a room.
- Stores last 100 messages per chat room.
- Dynamically displays messages from all users in real-time.

---

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web server framework.
- **Socket.IO**: Real-time bidirectional communication between client and server.
- **Redis**: In-memory data store for storing chat messages and sessions.
- **Express-session**: Session management.
- **Connect-Redis**: Redis session store.
- **HTML/CSS/JS**: Frontend UI.

---

## Architecture & Workflow

### 1. Client Side

- Users open the chat UI in the browser (`index.html`).  
- Users type a **username** and **message**.  
- On clicking "Send", the browser sends a message to the server using **Socket.IO**:

```js
socket.emit("send_message", {
  room: "global",
  message: "Hello",
  username: "Sowmiya"
});
````

### 2. Server Side

* The server receives the message via Socket.IO:

```js
socket.on("send_message", async ({ room, message, username }) => {
  const msgData = {
    username,
    message,
    room,
    timestamp: new Date().toISOString()
  };

  // Save message to Redis
  await saveMessage(msgData, room);

  // Broadcast message to all clients in the room
  io.to(room).emit("receive_message", msgData);
});
```

* **`saveMessage` function** stores messages in Redis:

```js
const key = `chat_${room}`;
await redisClient.rPush(key, JSON.stringify(msgData));
await redisClient.lTrim(key, -100, -1); // Keep last 100 messages
```

### 3. Redis

* Redis stores chat messages in a **list per chat room**.
* Example key: `chat_global`
* Allows **persistent chat history** and **fast retrieval** for all clients.

### 4. Loading Chat History

* When a new user or tab joins a room:

```js
socket.emit("join_room", { room: "global" });
```

* Server fetches messages from Redis:

```js
const messages = await getAllMessages(room);
socket.emit("chat_history", messages);
```

* Client renders messages using:

```js
messages.forEach(renderMessage);
```

### 5. Rendering Messages

* Each message is displayed dynamically by creating a new `<div>` for each message:

```js
function renderMessage(msg) {
  const div = document.createElement("div");
  div.textContent = `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.username}: ${msg.message}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
```

---

## Folder Structure

```
real-time-chat/
│
├─ public/
│   ├─ index.html
│   └─ main.js
│
├─ src/
│   ├─ sessions/
│   │   └─ sessionStore.js
│   ├─ utils/
│   │   └─ messageService.js
│   └─ services/
│       └─ redisClient.js
│
├─ server.js
├─ package.json
└─ .env
```

---

## How It Works (Step by Step)

1. **User opens chat page** → enters username.
2. **Username is stored in session** and optionally in browser storage.
3. **Socket.IO connection** is established.
4. **User joins a room** → server sends last 100 messages from Redis.
5. **User sends a message** → server stores it in Redis and broadcasts to all users in the room.
6. **Other users receive the message** in real-time.

---

## Key Concepts

### 1. Socket.IO

* Enables **real-time bidirectional communication**.
* Emits events like `send_message` and listens to `receive_message`.

### 2. Redis

* In-memory database for **fast data storage**.
* Stores messages per room using **lists**.
* Keeps **only last 100 messages** to save memory.

### 3. Express Session

* Stores **user session data** in Redis.
* Ensures that a user’s session persists across different tabs.

### 4. Message Persistence

* `saveMessage` ensures all chat messages are stored in Redis.
* `getAllMessages` fetches history whenever a user joins the room.

---

## Installation & Setup

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/real-time-chat.git
cd real-time-chat
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup environment variables** in `.env`:

```
REDIS_URL=redis://localhost:6379
PORT=3000
```

4. **Start Redis server**:

```bash
redis-server
```

5. **Start the Node.js server**:

```bash
node server.js
```

6. **Open browser**:

```
http://localhost:3000
```

---

## Usage

* Type your **username** and **message** → click **Send**.
* Open another tab → join the same room → chat history appears automatically.
* Multiple users can chat in real-time.


Do you want me to do that too?
```
