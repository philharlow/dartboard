import create from 'zustand'

export interface Player {
	name: string;
	pronunciation?: string;
};

const defaultPlayers: Player[] = [
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
	},
	{
		name: "Bellina",
	},
];

export type PlayerStore = {
	players: Player[];
	addPlayer: (player: Player) => void;
	updatePlayer: (player: Player) => void;
	removePlayer: (player: Player) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	players: defaultPlayers,
	addPlayer: (player: Player): void =>  {
	  const { players } = get();
	  set({ players: [ ...players, player ] });
	},
	updatePlayer: (player: Player): void =>  {
	  const { players } = get();
	  set({ players: [ ...players.filter(p => p.name !== player.name), player ] });
	},
	removePlayer: (player: Player) => {
		const { players } = get();
		set({ players: players.filter(p => p.name !== player.name) });
	},
  }));