import { useConnectionStore } from "./store/ConnectionStore";
import { io, Socket } from "socket.io-client";
import { DartThrow, GameStatus } from "./types/GameTypes";
import { useLedStore } from "./store/LedStore";
import { getCharFromRing, getLedsFromInts, Ring } from "./types/LedTypes";
import { useGameStore } from "./store/GameStore";
import { SocketEvent } from "./types/SocketTypes";
import { speak } from "./store/AudioStore";

export let socket: Socket | undefined;


export const connectSocket = async () => {
  socket = io(":4000");

  socket.on("connect", () => {
    console.log("WS connected!");
    useConnectionStore.setState({ socketConnected: true });
    // Refresh state
    fetchFreshState();
    //setSocketConnected(true);

  })
  socket.on("disconnect", () => {
    console.log("WS disconnected!");
    useConnectionStore.setState({ socketConnected: false });
  })
  
  socket.on("leds", (msg) => {
    const cloned = getLedsFromInts(msg);
    useLedStore.setState({ leds: cloned });
  })
  
  socket.on(SocketEvent.UPDATE_GAME_STATUS, (changes: Partial<GameStatus>) => {
    console.log("handling UPDATE_GAME_STATUS", changes);
    useGameStore.setState( changes as any );
  })
  
  socket.on(SocketEvent.ADD_DART_THROW, (newThrow: DartThrow) => {
    console.log("handling ADD_DART_THROW", newThrow);
    const { dartThrows } = useGameStore.getState();
    useGameStore.setState( { dartThrows: [ ...dartThrows, newThrow ] } );
  })
  
  socket.on(SocketEvent.SPEAK, ({ message, immediate }) => {
    console.log("handling SPEAK", message, immediate);
    speak(message, immediate);
  })
};

export const sendDartThrow = (score: number, ring: Ring) => {
  socket?.emit(SocketEvent.ADD_DART_THROW, getCharFromRing(ring) + score);
}

export const emit = (topic: string, data: any) => {
  socket?.emit(topic, data);
}

export const fetchFreshState = async () => {
		const resp = await fetch(document.location.protocol + '//' + document.location.hostname + ":4000/gameStatus");
		const gameStatus = await resp.json();
		console.log("got gameStatus", gameStatus);
		if (gameStatus)
			useGameStore.setState( gameStatus );
}



const autoConnect = true;
if (autoConnect)
  connectSocket();