import { useAudioStore } from "../store/AudioStore";

console.log("audio tools")


export const playSound = (filePath: string, volume = 1) => {
	const music = new Audio(filePath);
	music.volume = useAudioStore.getState().volume * volume;
	music.play();
	console.log("playing", filePath);
}
