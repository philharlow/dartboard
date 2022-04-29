import styled from '@emotion/styled/macro';
import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { LightDistraction, SocketEvent, SoundFX } from './types/SocketTypes';
import { emit } from './SocketInterface';
import { useState } from 'react';
import { useAudioStore } from './store/AudioStore';

const HecklerDiv = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
    justify-content: center;
`;
const CenterDiv = styled.div`
	display: flex;
	flex-direction: column;
`;
const ColumnDiv = styled.div`
	display: flex;
	flex-direction: column;
    padding: 10px;
`;

const Title = styled.div`
	font-size: 24px;
	padding-bottom: 10px;
	text-align: center;
`;

const HeckleButton = styled(Button)`
	font-size: 14px;
	padding: 2px;
	text-align: center;
	border: 1px solid white;
	margin: 5px;
`;
const ClearButton = styled.div`
	position: absolute;
	width: 17px;
	height: 17px;
	right: 4px;
	top: 4px;
	background-color: #777;
	border-radius: 50px;
    text-align: center;
    line-height: 12px;

`;
const InputContainer = styled.div`
	position: relative;
`;

function HecklerView() {
	const [ heckles, setHeckles ] = useState<string[]>([]);
	const [ text, setText ] = useState("");
	const setIsHeckler = useAudioStore(store => store.setIsHeckler);

	useEffect(() => {
		setIsHeckler(true);
	}, [setIsHeckler]);

	const sendHeckle = (heckle: string) => {
		emit(SocketEvent.HECKLE, heckle);
		if (!heckles.includes(heckle)) setHeckles([ heckle, ...heckles ]);
	};
	const handleKey = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			sendHeckle(text);
			setText("");
		}
	}
	const sendPlaySound = (sound: SoundFX) => {
		emit(SocketEvent.PLAY_SOUND, sound);
	};
	const sendDistraction = (distraction: LightDistraction) => {
		emit(SocketEvent.DISTRACTION, distraction);
	};

	return <HecklerDiv>
		<CenterDiv>
			<ColumnDiv>
				<Title>
					Heckle
				</Title>
				<InputContainer>
					<input type="text" onChange={(ev) => setText(ev.target.value)} value={text} onKeyDown={handleKey} ></input>
					{text.length > 0 && <ClearButton onClick={() => setText("")}>x</ClearButton>}
				</InputContainer>
				{ heckles.map(heckle => <HeckleButton variant='contained' key={heckle} onClick={() => sendHeckle(heckle)}>{heckle}</HeckleButton>) }
			</ColumnDiv>
			<ColumnDiv>
				<Title>
					Sounds
				</Title>
				{ Object.entries(SoundFX).map(([name, sound]) => <HeckleButton variant='contained' key={sound} onClick={() => sendPlaySound(sound)}>{name.split("_").join(" ")}</HeckleButton>) }
			</ColumnDiv>
			<ColumnDiv>
				<Title>
					Distractions
				</Title>
				{ Object.entries(LightDistraction).map(([_, distraction]) => <HeckleButton variant='contained' key={distraction} onClick={() => sendDistraction(distraction)}>{distraction}</HeckleButton>) }
			</ColumnDiv>
		</CenterDiv>
	</HecklerDiv>;
}

export default HecklerView;
