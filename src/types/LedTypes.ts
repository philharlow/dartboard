import { cloneDeep } from "lodash";

export enum Ring {
	Double,
	OuterSingle,
	Triple,
	InnerSingle,
	OuterBullseye,
	DoubleBullseye,
	Miss,
}

export interface Led {
	ring: Ring;
	score: number;
	on: boolean;
}

export type LedsObj = {
	[key: string]: Led;
};

export enum LedButton {
    UNDO,
    MISS,
    NEXT,
}

export type Coordinate = { x: number, y: number };
export type LedXYCoords = {
	[key: string]: Coordinate;
};
export const ledXYCoords: LedXYCoords = {};

export interface AnimationFrame {
	time: number;
	leds: LedsObj;
};

export enum AnimationType {
	WIPE,
	SOLID_WIPE,
	CHECKERBOARD,
	ALTERNATING_SCORES,
	GROW,
	SHRINK,
	BULLSEYE,
}

export interface LedAnimation {
	frames: AnimationFrame[];
	name: string;
	clearAfter?: boolean;
	type: AnimationType;
};

export type CalibrationMap = {
	[key: string]: string;
};

interface LedMatrixCoord {
    col: number;
    row: number;
}

export type LedCalibrationMap = {
	[key: string]: LedMatrixCoord[];
};

export interface Hint {
	ring: Ring;
	score: number;
}

export const getCharFromRing = (ring: Ring) => {
	if (ring === Ring.Triple) return "t";
	if (ring === Ring.Double || ring === Ring.DoubleBullseye) return "d";
	if (ring === Ring.OuterSingle) return "o";
	return "s";
};

export const getRingFromChar = (char: string) => {
	if (char === "m") return Ring.Miss;
	if (char === "t") return Ring.Triple;
	if (char === "d") return Ring.Double;
	if (char === "o") return Ring.OuterSingle;
	return Ring.InnerSingle;
}

export const getLedsAsInts = (ledsObj: LedsObj) => {
	const doubleBullseye = ledsObj["d25"];
	const outerBullseye = ledsObj["s25"];
	const bullseyes = ((doubleBullseye?.on ? 1 : 0) << 0) + ((outerBullseye?.on ? 1 : 0) << 1);
	const ints = [
		getRingAsInt(ledsObj, Ring.Double),
		getRingAsInt(ledsObj, Ring.OuterSingle),
		getRingAsInt(ledsObj, Ring.Triple),
		getRingAsInt(ledsObj, Ring.InnerSingle),
		bullseyes
	];
	return ints;
}

export const getRingAsInt = (ledsObj: LedsObj, ring: Ring) => {
	let acc = 0;
	for (let i=0; i< 20; i++)
		if (ledsObj[getLedKey(i + 1, ring)]?.on) // keys start at 1
			acc += 1 << i;
	return acc;
	// return leds.filter(led => led.ring === ring).reduce((acc, led, i) => acc + ((led.on ? 1 : 0) << i) , 0);
}

// TODO: optimize this!
export const getLedsFromInts = (ints: number[]) => {
	const ledsObj = cloneDeep(initialLedsObj);
	setRingFromInt(ledsObj, Ring.Double, ints[0]);
	setRingFromInt(ledsObj, Ring.OuterSingle, ints[1]);
	setRingFromInt(ledsObj, Ring.Triple, ints[2]);
	setRingFromInt(ledsObj, Ring.InnerSingle, ints[3]);

	const bullseyes = ints[4];
	const doubleBullseye = ledsObj[getLedKey(25, Ring.DoubleBullseye)];
	doubleBullseye.on = ((bullseyes >> 0) & 1) === 1;
	const outerBullseye = ledsObj[getLedKey(25, Ring.OuterBullseye)];
	outerBullseye.on = ((bullseyes >> 1) & 1) === 1;

	return ledsObj;
}

export const setRingFromInt = (ledsObj: LedsObj, ring: Ring, int: number) =>{
	for (let i=0; i< 20; i++) {
		const led = ledsObj[getLedKey(i + 1, ring)]; // keys start at 1
		if (led)
			led.on = ((int >> i) & 1) === 1;
	}
}

export const scoreOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export const growOrder = [Ring.DoubleBullseye, Ring.OuterBullseye, Ring.InnerSingle, Ring.Triple, Ring.OuterSingle, Ring.Double];
export const ledKeysFromRingThenScore: {[ index: number]: string[]} = [];
for (const ring of growOrder) ledKeysFromRingThenScore[ring] = [];

export const getLedKey = (score: number, ring: Ring) => {
	if (ring === Ring.Miss || score <= 0) return "";
	return ledKeysFromRingThenScore[ring][score];
	//if (ring === Ring.Triple) return "t" + score;
	//if (ring === Ring.Double || ring === Ring.DoubleBullseye) return "d" + score;
	//if (ring === Ring.OuterSingle) return "o" + score;
	//return "s" + score;
}
export const getLedCode = (score: number, ring: Ring) => {
	const ringScore = 20 * ring;
	const wedgeScore = score - 1;
	return ringScore + wedgeScore;
}
export const getScoreFromCode = (code: number) => {
	const ring: Ring = Math.floor(code / 20);
	const score = (code % 20) + 1;
	return { score, ring };
}

export const getLedKeySlow = (score: number, ring: Ring) => {
	if (ring === Ring.Triple) return "t" + score;
	if (ring === Ring.Double || ring === Ring.DoubleBullseye) return "d" + score;
	if (ring === Ring.OuterSingle) return "o" + score;
	return "s" + score;
}

// Measured distances for each ring from the bullseye. Units do't matter if you change them
const distances: Map<Ring, number> = new Map();
distances.set(Ring.Double, 18.5);
distances.set(Ring.OuterSingle, 15);
distances.set(Ring.Triple, 11.25);
distances.set(Ring.InnerSingle, 6.5);
export const diameter = 2 * distances.get(Ring.Double)!;

const addXYCoord = (ledKey: string, score: number, ring: Ring) => {
	if (ring === Ring.DoubleBullseye || ring === Ring.OuterBullseye) {
		ledXYCoords[ledKey] = { x: 0, y: 0 };
		return;
	}
	const scoreIndex = scoreOrder.indexOf(score);
	const angleDeg = scoreIndex * (360 / 20);
	const angleRad = angleDeg * Math.PI / 180;
	const distance = distances.get(ring)!;
	//console.log("score", score, scoreIndex, angleDeg, angleRad);
	const x = Math.sin(angleRad) * distance;
	const y = Math.cos(angleRad) * distance;
	ledXYCoords[ledKey] = { x, y };
};

export const initialLedsObj: LedsObj = {};
const initialOn = false;
const addLed = (score: number, ring: Ring, on: boolean) => {
	const ledKey = getLedKeySlow(score, ring);
	ledKeysFromRingThenScore[ring][score] = ledKey;
	initialLedsObj[ledKey] = { score, ring, on };
	addXYCoord(ledKey, score, ring);
};

for (let i=1; i<=20; i++) {
	addLed(i, Ring.InnerSingle, initialOn);
	addLed(i, Ring.OuterSingle, initialOn);
	addLed(i, Ring.Double, initialOn);
	addLed(i, Ring.Triple, initialOn);
}
addLed(25, Ring.DoubleBullseye, initialOn);
addLed(25, Ring.OuterBullseye, initialOn);

export const turnOnCircle = (center: Coordinate, innerRadius: number, outerRadius: number) => {
	const leds = cloneDeep(initialLedsObj);
	const innerRadiusSq = innerRadius * innerRadius;
	const outerRadiusSq = outerRadius * outerRadius;
	for (const led in leds) {
		const ledObj = leds[led];
		const { x, y } = ledXYCoords[led];
		const xOffset = center.x - x;
		const yOffset = center.y - y;
		const distanceSq = xOffset * xOffset + yOffset * yOffset;
		if (distanceSq >= innerRadiusSq && distanceSq <= outerRadiusSq) {
			ledObj.on = true;
		}
	}
	return leds;
};

export const turnOnLine = (lineX?: number, lineY?: number, thickness = 5) => {
	const leds = cloneDeep(initialLedsObj);
	const halfThickness = 0.5 * thickness;
	for (const led in leds) {
		const ledObj = leds[led];
		const { x, y } = ledXYCoords[led];
		if (lineX !== undefined && Math.abs(x - lineX) < halfThickness) ledObj.on = true;
		if (lineY !== undefined && Math.abs(y - lineY) < halfThickness) ledObj.on = true;
	}
	return leds;
};