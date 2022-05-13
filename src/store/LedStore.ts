import { cloneDeep } from 'lodash';
import create from 'zustand'
import { initialLedsObj, LedsObj } from '../types/LedTypes';


export type LedStore = {
	ledsObj: LedsObj;
	setLeds: (ledsObj: LedsObj) => void;
	buttonLeds: boolean[];
	setButtonLeds: (buttonLeds: boolean[]) => void;
};

export const useLedStore = create<LedStore>((set, get) => ({
	ledsObj: cloneDeep(initialLedsObj),
	setLeds: (ledsObj: LedsObj) => {
		set({ ledsObj });
	},
	buttonLeds: [false, false, false],
	setButtonLeds: (buttonLeds: boolean[]) => {
		set({ buttonLeds });
	}
  }));