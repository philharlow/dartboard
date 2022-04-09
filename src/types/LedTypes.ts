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
export const wedgeOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
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

export const initialLedsObj: LedsObj = {};
const initialOn = false;
const addLed = (score: number, ring: Ring, on: boolean) => {
	ledKeysFromRingThenScore[ring][score] = getLedKeySlow(score, ring);
	initialLedsObj[getLedKey(score, ring)] = { score, ring, on }
};

for (let i=1; i<=20; i++) {
	addLed(i, Ring.InnerSingle, initialOn);
	addLed(i, Ring.OuterSingle, initialOn);
	addLed(i, Ring.Double, initialOn);
	addLed(i, Ring.Triple, initialOn);
}
addLed(25, Ring.DoubleBullseye, initialOn);
addLed(25, Ring.OuterBullseye, initialOn);
