import { useConnectionStore } from "./store/ConnectionStore";
import { io, Socket } from "socket.io-client";
import { DartThrow, GameStatus } from "./types/GameTypes";
import { useLedStore } from "./store/LedStore";
import { getCharFromRing, getLedsFromInts, Ring } from "./types/LedTypes";
import { useGameStore } from "./store/GameStore";
import { SocketEvent, SoundFX } from "./types/SocketTypes";
import { speak } from "./store/AudioStore";
import { serverFetch } from "./tools/ClientUtils";
import { playSound } from "./tools/AudioTools";
import { range } from "lodash";

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
  
  socket.on(SocketEvent.UPDATE_LEDS, (msg) => {
    const ledsObj = getLedsFromInts(msg);
    useLedStore.setState({ ledsObj });
  })
  
  socket.on(SocketEvent.UPDATE_BUTTON_LEDS, (msg) => {
    const buttonLeds = range(0, 3).map((i: number) => ((msg >> i) & 1) === 1);
    useLedStore.setState({ buttonLeds });
  })
  
  socket.on(SocketEvent.UPDATE_GAME_STATUS, (changes: Partial<GameStatus>) => {
    //console.log("handling UPDATE_GAME_STATUS", changes);
    useGameStore.setState( changes as any );
  })
  
  socket.on(SocketEvent.ADD_DART_THROW, (newThrow: DartThrow) => {
    //console.log("handling ADD_DART_THROW", newThrow);
    const { dartThrows } = useGameStore.getState();
    useGameStore.setState( { dartThrows: [ ...dartThrows, newThrow ] } );
  })
  
  socket.on(SocketEvent.SET_CALIBRATION_STEP, () => {
    playSound(SoundFX.BEEP_XYLO);
  })
  
  socket.on(SocketEvent.PLAY_SOUND, (pathToSound) => {
    playSound(pathToSound);
  })
  
  socket.on(SocketEvent.SPEAK, ({ message, immediate }) => {
    //console.log("handling SPEAK", message, immediate);
    speak(message, immediate);
  })
  
  socket.on(SocketEvent.SHOW_POPUP, (popupMessage) => {
    useConnectionStore.setState({popupMessage});
  })
};

export const sendDartThrow = (score: number, ring: Ring) => {
  socket?.emit(SocketEvent.ADD_DART_THROW, getCharFromRing(ring) + score);
}

export const emit = (topic: SocketEvent, data: any = undefined) => {
  socket?.emit(topic, data);
}

export const fetchFreshState = async () => {
		const gameStatus = await serverFetch("gameStatus");
		console.log("got gameStatus", gameStatus);
		if (gameStatus)
			useGameStore.setState( gameStatus );
}

const autoConnect = true;
if (autoConnect)
  connectSocket();
