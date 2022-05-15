import { cloneDeep } from 'lodash';
import create from 'zustand'

export type AudioStore = {
	volume: number;
	isHeckler: boolean;
	selectedVoice: number;
	voiceNames: string[];
	ttsQueue: string[];
	setVolume: (volume: number) => void;
	setVoiceNames: (voices: string[]) => void;
	setSelectedVoice: (voice: number) => void;
	setTTSQueue: (ttsQueue: string[]) => void;
	addTTSMessage: (message: string) => void;
	setIsHeckler: (heckler: boolean) => void;
};

const getLocalStorage = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");
const setLocalStorage = (key:string, value: any) => localStorage.setItem(key, JSON.stringify(value));

export const useAudioStore = create<AudioStore>((set, get) => ({
	volume: getLocalStorage("volume") ?? 1,
	voiceNames: [""],
	selectedVoice: getLocalStorage("selectedVoice") ?? 0,
	ttsQueue: [],
	isHeckler: false,
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
		safeSpeechSynthesis?.cancel();
		(window as any).fully?.stopTextToSpeech(); // Fully kiosk browser support
		checkQueue();
	},
	addTTSMessage: (message: string) => {
		const { ttsQueue } = get();
		set({ ttsQueue: [ ...ttsQueue, message ] });
		checkQueue();
	},
	setIsHeckler: (isHeckler: boolean): void =>  {
	  	set({ isHeckler });
	},
}));

const checkQueue = async () => {
	const { ttsQueue } = useAudioStore.getState();
	if (ttsQueue.length && (!safeSpeechSynthesis || !safeSpeechSynthesis.speaking)) {
		const newQueue = cloneDeep(ttsQueue);
		const message = newQueue.shift();
		useAudioStore.setState({ ttsQueue: newQueue })
		await _speak(message!);
		checkQueue();
	}
};

export let safeSpeechSynthesis: any = undefined;
try {
	safeSpeechSynthesis = window.speechSynthesis;
} catch (e) { console.log("No speech synthesis found"); }


const _speak = (message: string) => {
	return new Promise(resolve => {
		const { selectedVoice, volume } = useAudioStore.getState();
		if (volume <= 0) return;
		// console.log("speaking", message);
		// alert("fully " + fully + " window.fully " + (window as any).fully);
		
		if (safeSpeechSynthesis) {
			safeSpeechSynthesis.cancel();
			const msg = new SpeechSynthesisUtterance(message);
			msg.voice = safeSpeechSynthesis.getVoices()[selectedVoice];
			msg.volume = volume;
			msg.onend = resolve;
			safeSpeechSynthesis.speak(msg);
		} else if ((window as any).fully) {
			// Fully kiosk browser support
			// We can return immediately here as fullykiosk queues tts for us (and doesnt give us a callback, either)
			(window as any).fully.textToSpeech(message);
		}
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
