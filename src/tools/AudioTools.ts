import { useAudioStore } from "../store/AudioStore";
import { SoundFX } from "../types/SocketTypes";


export const playSound = (sound: SoundFX, volume = 1) => {
	if (useAudioStore.getState().isHeckler) return;
	const audio = new Audio(sound);
	audio.volume = useAudioStore.getState().volume * volume;
	audio.play();
	console.log("playing", sound, audio.volume);
}

export const preloadSounds = () =>{
	if (useAudioStore.getState().isHeckler) return;
	for (const sound of Object.values(SoundFX)) {
		const audio = new Audio();
		audio.addEventListener('canplaythrough', () => console.log("sound loaded", sound), false);
		audio.src = sound;
		console.log("preloading", sound);
	}
};