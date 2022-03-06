import { useAudioStore } from "../store/AudioStore";


export const playSound = (filePath: string) => {
	const music = new Audio(filePath);
	music.volume = useAudioStore.getState().volume;
	music.play();
	console.log("playing", filePath);
}
