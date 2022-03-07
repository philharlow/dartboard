import create from 'zustand'

export type ConnectionStore = {
	socketConnected: boolean;
	setSocketConnected: (connected: boolean) => void;
	// Deprecated
	serialConnected: boolean;
	setSerialConnected: (connected: boolean) => void;
};

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
	socketConnected: false,
	setSocketConnected: (socketConnected: boolean) => {
		set({ socketConnected })
	},
	serialConnected: false,
	setSerialConnected: (serialConnected: boolean) => {
		set({ serialConnected })
	},
  }));