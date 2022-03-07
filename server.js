const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const readline = require('readline').createInterface({
  input: process.stdin,
  //output: process.stdout
})


app.use(cors());

let user = "World";

app.get('/', (req, res) => {
  res.send('Hello ' + user);
  //res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on("disconnect", (reason) => {
    console.log('socket disconnected');
  });
  socket.on("leds", (leds) => {
    console.log('socket get leds:', leds);
  });
});


server.listen(3001, () => {
  console.log('listening on *:3001');
  console.log("Type to send dart commands");

  readline.addListener("line", (line) => {
    console.log("got line " + line);
    user = line;
    io.emit("dart", line);
  })

});
