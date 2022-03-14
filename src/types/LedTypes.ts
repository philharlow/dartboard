import { cloneDeep } from "lodash";


export enum Ring {
	InnerBullseye,
	OuterBullseye,
	InnerSingle,
	Triple,
	OuterSingle,
	Double,
	Miss,
}

export interface Led {
	ring: Ring;
	score: number;
	on: boolean;
}

export interface Hint {
	ring: Ring;
	score: number;
}

export const getCharFromRing = (ring: Ring) => {
	if (ring === Ring.Triple) return "t";
	if (ring === Ring.Double || ring === Ring.InnerBullseye) return "d";
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

export const getLedsAsInts = (leds: Led[]) => {
	const innerBullseye = leds.find(led => led.ring === Ring.InnerBullseye);
	const outerBullseye = leds.find(led => led.ring === Ring.OuterBullseye);
	const bullseyes = ((innerBullseye?.on ? 1 : 0) << 0) + ((outerBullseye?.on ? 1 : 0) << 1);
	const ints = [
		getRingAsInt(leds, Ring.Double),
		getRingAsInt(leds, Ring.OuterSingle),
		getRingAsInt(leds, Ring.Triple),
		getRingAsInt(leds, Ring.InnerSingle),
		bullseyes
	];
	return ints;
}

export const getRingAsInt = (leds: Led[], ring: Ring) => {
	return leds.filter(led => led.ring === ring).reduce((acc, led, i) => acc + ((led.on ? 1 : 0) << i) , 0);
}

// TODO: optimize this!
export const getLedsFromInts = (ints: number[]) => {
	const leds = cloneDeep(initialLeds);
	setRingFromInt(leds, Ring.Double, ints[0]);
	setRingFromInt(leds, Ring.OuterSingle, ints[1]);
	setRingFromInt(leds, Ring.Triple, ints[2]);
	setRingFromInt(leds, Ring.InnerSingle, ints[3]);
	const bullseyes = ints[4];
	const innerBullseye = leds.find(led => led.ring === Ring.InnerBullseye);
	if (innerBullseye) innerBullseye.on = ((bullseyes >> 0) & 1) === 1;
	const outerBullseye = leds.find(led => led.ring === Ring.OuterBullseye);
	if (outerBullseye) outerBullseye.on = ((bullseyes >> 1) & 1) === 1;
	return leds;
}

export const setRingFromInt = (leds: Led[], ring: Ring, int: number) =>{
	for (let i=0; i< 20; i++) {
		const led = leds.find(led => led.ring === ring && led.score === i + 1);
		if (led)
			led.on = ((int >> i) & 1) === 1;
	}
}

export const scoreOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export const growOrder = [Ring.InnerBullseye, Ring.OuterBullseye, Ring.InnerSingle, Ring.Triple, Ring.OuterSingle, Ring.Double];

export const initialLeds: Led[] = [];
const on = false;
for (let i=1; i<=20; i++) {
	initialLeds.push({ring: Ring.InnerSingle, score: i, on});
	initialLeds.push({ring: Ring.OuterSingle, score: i, on});
	initialLeds.push({ring: Ring.Double, score: i, on});
	initialLeds.push({ring: Ring.Triple, score: i, on});
}
initialLeds.push({ring: Ring.InnerBullseye, score: 25, on});
initialLeds.push({ring: Ring.OuterBullseye, score: 25, on});
