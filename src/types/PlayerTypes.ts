
export interface Player {
	name: string;
	pronounciation?: string;
};

export const defaultPlayers: Player[] = [
	{
		name: "Phil",
	},
	{
		name: "Mike",
	},
	{
		name: "Jay",
	},
	{
		name: "Knodel",
		pronounciation: "nodel",
	},
	{
		name: "Josh",
	},
	{
		name: "Erik",
	},
	{
		name: "Jake",
	},
	{
		name: "Bellina",
	},
	{
		name: "Kenny",
	},
	{
		name: "Jessie",
	},
];

export const getPronounciation = (allPlayers: Player[], name: string) => {
	const player = allPlayers.find(p => p.name === name);
	return player?.pronounciation || name;
};
