

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

