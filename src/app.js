const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

module.exports = {
  server,
  io,
};
