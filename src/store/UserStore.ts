import create from 'zustand'

export type UserStore = {
	score: number;
	addScore: (added: number) => void;
	setScore: (score: number) => void;
};

export const useUsersStore = create<UserStore>((set, get) => ({
	score: 0,
	addScore: (added: number): void =>  {
	  const { score } = get();
	  set({ score: score + added });
	},
	setScore: (score: number) => {
		set({ score });
	},
}));