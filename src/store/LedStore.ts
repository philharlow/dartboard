import create from 'zustand'
import { Led } from '../types/LedTypes';


export type LedStore = {
	leds: Led[];
	setLeds: (leds: Led[]) => void;
};

export const useLedStore = create<LedStore>((set, get) => ({
	leds: [],
	setLeds: (leds: Led[]) => {
		set({ leds });
	},
  }));