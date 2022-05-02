import { getLedKey, Ring, scoreOrder } from "./LedTypes";

export enum SocketEvent {
	START_GAME = "START_GAME",
	SET_SETTINGS = "SET_SETTINGS",
	SET_PLAYERS = "SET_PLAYERS",
	UPDATE_GAME_STATUS = "UPDATE_GAME_STATUS",
	ADD_DART_THROW = "ADD_DART_THROW",
	NEXT_PLAYER = "NEXT_PLAYER",
	UNDO_LAST_DART = "UNDO_LAST_DART",
	SET_WAITING_FOR_THROW = "SET_WAITING_FOR_THROW",
	SPEAK = "SPEAK",
	UPDATE_LEDS = "UPDATE_LEDS",
	OPEN_SERIAL_CONNECTION = "OPEN_SERIAL_CONNECTION",
	SET_CALIBRATION_STEP = "SET_CALIBRATION_STEP",
	CLEAR_CALIBRATION = "CLEAR_CALIBRATION",
	SHOW_POPUP = "SHOW_POPUP",
	HECKLE = "HECKLE",
	PLAY_SOUND = "PLAY_SOUND",
	DISTRACTION = "DISTRACTION",
}

export const calibrationOrder: string[] = [];
calibrationOrder.push(getLedKey(25, Ring.DoubleBullseye));
calibrationOrder.push(getLedKey(25, Ring.OuterBullseye));
for (let i=0; i<20; i++) {
	const score = scoreOrder[i];
	calibrationOrder.push(getLedKey(score, Ring.InnerSingle));
	calibrationOrder.push(getLedKey(score, Ring.Triple));
	calibrationOrder.push(getLedKey(score, Ring.OuterSingle));
	calibrationOrder.push(getLedKey(score, Ring.Double));
}

export enum SoundFX {
	BULLS_EYE = "sounds/bullseye.mp3",
	BASEBALL_HIT = "sounds/baseball-hit.mp3",
	CHEERING = "sounds/cheering.mp3",
	BEEP_XYLO = "sounds/beep-xylo.mp3",
	SUCCESS = "sounds/success.mp3",
};

export enum LightDistraction {
	ADD_RANDOM_HINT = "Add Random Hint",
	REMOVE_HINTS = "Clear Hints",
	WIPE_ANIMATION = "Wipe Animation",
	GROW_ANIMATION = "Grow Animation",
};

