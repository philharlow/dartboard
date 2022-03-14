import create from 'zustand'
import { Player, defaultPlayers } from '../types/PlayerTypes';

export type PlayerStore = {
	allPlayers: Player[];
	addPlayer: (player: Player) => void;
	updatePlayer: (player: Player) => void;
	removePlayer: (player: Player) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	allPlayers: defaultPlayers,
	addPlayer: (player: Player): void =>  {
	  const { allPlayers } = get();
	  set({ allPlayers: [ ...allPlayers, player ] });
	},
	updatePlayer: (player: Player): void =>  {
	  const { allPlayers } = get();
	  set({ allPlayers: [ ...allPlayers.filter(p => p.name !== player.name), player ] });
	},
	removePlayer: (player: Player) => {
		const { allPlayers } = get();
		set({ allPlayers: allPlayers.filter(p => p.name !== player.name) });
	},
  }));
