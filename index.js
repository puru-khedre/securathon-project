require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

connectDB();
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const port = 3001;

app.get("/api/puru", (req, res) => {
  return res.json({ msg: "puru" });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const __dirname1 = path.resolve();
console.log({ __dirname1 });

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("test-listen", (data) => {
    console.log("bolo".red.bold);
    io.emit("suno", data);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      console.log({ userId: user._id, content: newMessageRecieved.content });
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

module.exports = app;
