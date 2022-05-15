import styled from '@emotion/styled/macro';
import Drawer, { DrawerPosition } from './Drawer';
import { safeSpeechSynthesis, speak, useAudioStore } from '../../store/AudioStore';
import { MenuItem, Select, Slider } from '@mui/material';
import { useEffect } from 'react';
import { playSound } from '../../tools/AudioTools';
import { SoundFX } from '../../types/SocketTypes';

const Title = styled.div`
	font-weight: bold;
	text-align: center;
`;
const ColoredSlider = styled(Slider)`
	color: #fff;
`;
const ColoredSelect = styled(Select)`
	width: 100%;
	color: #fff;
	fieldset {
		border-color: #fff;
	}
	svg {
      fill: #fff;
    }
`;

function AudioDrawer() {
	const volume = useAudioStore(store => store.volume);
	const setVolume = useAudioStore(store => store.setVolume);
	const selectedVoice = useAudioStore(store => store.selectedVoice);
	const setSelectedVoice = useAudioStore(store => store.setSelectedVoice);
	const voiceNames = useAudioStore(store => store.voiceNames);
	const setVoiceNames = useAudioStore(store => store.setVoiceNames);

	useEffect(() => {
		if (voiceNames[0] === "" && safeSpeechSynthesis) {
			// Fully kiosk will error out when trying to access speechSyntehsis 
			safeSpeechSynthesis.onvoiceschanged = () => {
				const foundVoices = safeSpeechSynthesis.getVoices();
				const newVoiceNames = foundVoices.map(({ name }: any) => name.split(" - ")[0].split("(")[0]);
				setVoiceNames(newVoiceNames);
			};
		}
	}, [setVoiceNames, voiceNames]);

	const selectVoice = (voiceIndex: number) => {
		const selectedVoice = voiceNames[voiceIndex];
		setSelectedVoice(voiceIndex);
		speak(selectedVoice);
	}

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right:"44px"}} drawerStyle={{width: 200, right: 0, paddingBottom: 50}} tabLabel="Audio">
			<Title>
				Volume
			</Title>
			<ColoredSlider
				value={volume * 100}
				aria-label="Volume slider"
				onChange={(e, val) => setVolume(+val / 100)}
				onPointerUp={() => playSound(SoundFX.BEEP_XYLO)}
				/>
			<br />
			<Title>
				Voice
			</Title>
			<ColoredSelect
				value={voiceNames[0] !== "" ? selectedVoice : 0}
				onChange={(ev) => selectVoice((ev.target.value as number))}
				>
					{voiceNames.map((voice, i) => 
						<MenuItem key={i} value={i}>{voice}</MenuItem>
					)}
			</ColoredSelect>
		</Drawer>
	);
}

export default AudioDrawer;




