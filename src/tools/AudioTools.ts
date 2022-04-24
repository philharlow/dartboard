import { useAudioStore } from "../store/AudioStore";
import { SoundFX } from "../types/SocketTypes";

console.log("audio tools")


export const playSound = (sound: SoundFX, volume = 1) => {
	const music = new Audio(sound);
	music.volume = useAudioStore.getState().volume * volume;
	music.play();
	console.log("playing", sound);
}
