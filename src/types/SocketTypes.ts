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
}

export type CalibrationObj = {
	ring: Ring;
	score: number;
	x: number;
	y: number;
};

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
