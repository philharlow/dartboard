import create from 'zustand'

export interface PopupMessage {
	message: string,
	sound: string,
}

export type ConnectionStore = {
	popupMessage?: PopupMessage;
	setPopupMessage: (popup?: PopupMessage) => void;
	socketConnected: boolean;
	setSocketConnected: (connected: boolean) => void;
	// Deprecated
	serialConnected: boolean;
	setSerialConnected: (connected: boolean) => void;
};

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
	popupMessage: undefined,
	setPopupMessage: (popupMessage?: PopupMessage) => {
		set({ popupMessage })
	},
	socketConnected: false,
	setSocketConnected: (socketConnected: boolean) => {
		set({ socketConnected })
	},
	serialConnected: false,
	setSerialConnected: (serialConnected: boolean) => {
		set({ serialConnected })
	},
  }));