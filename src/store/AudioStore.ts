import { cloneDeep } from 'lodash';
import create from 'zustand'

export type AudioStore = {
	volume: number;
	selectedVoice: number;
	voiceNames: string[];
	ttsQueue: string[];
	setVolume: (volume: number) => void;
	setVoiceNames: (voices: string[]) => void;
	setSelectedVoice: (voice: number) => void;
	setTTSQueue: (ttsQueue: string[]) => void;
	addTTSMessage: (message: string) => void;
};

const getLocalStorage = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");
const setLocalStorage = (key:string, value: any) => localStorage.setItem(key, JSON.stringify(value));

export const useAudioStore = create<AudioStore>((set, get) => ({
	volume: getLocalStorage("volume") ?? 1,
	voiceNames: [""],
	selectedVoice: getLocalStorage("selectedVoice") ?? 0,
	ttsQueue: [],
	setVolume: (volume: number): void =>  {
		set({ volume });
		setLocalStorage("volume", volume);
	},
	setVoiceNames: (voiceNames: string[]): void =>  {
	  	set({ voiceNames });
	},
	setSelectedVoice: (selectedVoice: number) => {
		set({ selectedVoice });
	  	setLocalStorage("selectedVoice", selectedVoice);
	},
	
	setTTSQueue: (ttsQueue: string[]) => {
		set({ ttsQueue });
		speechSynthesis.cancel();
		checkQueue();
	},
	addTTSMessage: (message: string) => {
		const { ttsQueue } = get();
		set({ ttsQueue: [ ...ttsQueue, message ] });
		checkQueue();
	},
}));

const checkQueue = async () => {
	const { ttsQueue } = useAudioStore.getState();
	if (ttsQueue.length && !speechSynthesis.speaking) {
		const newQueue = cloneDeep(ttsQueue);
		const message = newQueue.shift();
		useAudioStore.setState({ ttsQueue: newQueue })
		await _speak(message!);
		checkQueue();
	}
};

const _speak = (message: string) => {
	return new Promise(resolve => {
		const { selectedVoice, volume } = useAudioStore.getState();
		if (volume <= 0) return;
		
		speechSynthesis.cancel();
		const msg = new SpeechSynthesisUtterance(message);
		msg.voice = speechSynthesis.getVoices()[selectedVoice];
		msg.volume = volume;
		msg.onend = resolve;
		window.speechSynthesis.speak(msg);
	});
}
export const speak = (message: string, immediate = false ) => {
	const { addTTSMessage, setTTSQueue } = useAudioStore.getState();
	if (immediate)
		setTTSQueue([message]);
	else
		addTTSMessage(message);
};

(window as any).speak = speak;