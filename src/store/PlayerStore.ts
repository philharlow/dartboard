import create from 'zustand'
import { serverFetch } from '../tools/ClientUtils';
import { Player } from '../types/PlayerTypes';

export type PlayerStore = {
	allPlayers?: Player[];
	lastPlayers?: Player[];
	edittingPlayers?: boolean;
	edittingPlayer?: Player;
	setEdittingPlayer: (edittingPlayer?: Player) => void;
	setEdittingPlayers: (edittingPlayers: boolean) => void;
	setLastPlayers: (lastPlayers: Player[]) => void;
	addPlayer: (player: Player) => void;
	updatePlayer: (player: Player) => void;
	removePlayer: (player: Player) => void;
	fetchAllPlayers: () => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	setEdittingPlayer: (edittingPlayer?: Player) => {
		set({ edittingPlayer });
	},
	setEdittingPlayers: (edittingPlayers: boolean) => {
		set({ edittingPlayers });
	},
	setLastPlayers: (lastPlayers: Player[]) => {
		set({ lastPlayers });
	},
	addPlayer: (player: Player): void =>  {
	  const { allPlayers } = get();
	  if (allPlayers)
		  set({ allPlayers: [ ...allPlayers, player ] });
	},
	updatePlayer: (player: Player): void =>  {
	  const { allPlayers } = get();
	  if (allPlayers)
		  set({ allPlayers: [ ...allPlayers.filter(p => p.name !== player.name), player ] });
	},
	removePlayer: (player: Player) => {
		const { allPlayers } = get();
		if(allPlayers)
			set({ allPlayers: allPlayers.filter(p => p.name !== player.name) });
	},
	fetchAllPlayers: async () => {
		const allPlayers = await serverFetch("allPlayers");
		console.log("got allPlayers", allPlayers);
		if (allPlayers)
			set({ allPlayers });
	},
  }));
