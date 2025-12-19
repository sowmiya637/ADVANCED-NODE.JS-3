// main.js

const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const usernameInput = document.getElementById("username");
const sendBtn = document.getElementById("sendBtn");

const ROOM = "global";
let socket;


// Render message

function renderMessage(msg) {
  const div = document.createElement("div");
  div.textContent = `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.username}: ${msg.message}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}


// Start socket IMMEDIATELY

function initSocket() {
  socket = io();

  // Join room 
  socket.emit("join_room", { room: ROOM });

  socket.on("chat_history", (messages) => {
    chat.innerHTML = "";
    messages.forEach(renderMessage);
  });

  socket.on("receive_message", renderMessage);
}


// Send message

sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (!message) return;

  let username = sessionStorage.getItem("username");

  // Ask username if not set
  if (!username) {
    username = usernameInput.value.trim();
    if (!username) {
      alert("Please enter username");
      return;
    }

    sessionStorage.setItem("username", username);
   
    usernameInput.value = "";

    //  save in session on server
    await fetch("/set-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
  }

  socket.emit("send_message", {
    room: ROOM,
    message,
    username
  });

  messageInput.value = "";
});


// Restore username per tab

const savedUsername = sessionStorage.getItem("username");
if (savedUsername) {
  usernameInput.value = savedUsername;
  usernameInput.disabled = true;
}

initSocket();
