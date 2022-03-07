import { useConnectionStore } from "./store/ConnectionStore";
import { io, Socket } from "socket.io-client";
import { addDartThrow, parseDartCode } from "./gameTypes/GameType";

let socket: Socket | undefined;


export const connectSocket = async () => {
  socket = io(":3001");

  socket.on("connect", () => {
    console.log("WS connected!");
    const { setSocketConnected } = useConnectionStore.getState();
    setSocketConnected(true);

  })
  socket.on("disconnect", () => {
    console.log("WS disconnected!");
    const { setSocketConnected } = useConnectionStore.getState();
    setSocketConnected(false);

  })
  
  socket.on("dart", (msg) => {
    console.log("got WS dart:" + msg);
    const { ring, score } = parseDartCode(msg);
    addDartThrow(score, ring);
  })
};

export const writeToSocket = (topic: string, lines: string[]) => {
  socket?.emit("leds", lines);
}

const autoConnect = true;
if (autoConnect)
  connectSocket();