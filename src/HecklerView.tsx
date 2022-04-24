import styled from '@emotion/styled/macro';
import React from 'react';
import { Button } from '@mui/material';
import { SocketEvent } from './types/SocketTypes';
import { emit } from './SocketInterface';
import { useAudioStore } from './store/AudioStore';
import { useState } from 'react';

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

const Title = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
	text-align: center;
`;

const Heckle = styled.div`
	font-size: 14px;
	padding-bottom: 5px;
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
	const setVolume = useAudioStore(store => store.setVolume);

	const sendHeckle = (heckle: string) => {
		setVolume(0);
		emit(SocketEvent.HECKLE, heckle);
		if (!heckles.includes(heckle)) setHeckles([ ...heckles, heckle ]);
	};
	const handleKey = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			sendHeckle(text);
			setText("");
		}
	}

	return <HecklerDiv>
		<CenterDiv>
			<Title>
				Heckle
			</Title>
			{ heckles.map(heckle => <Heckle key={heckle} onClick={() => sendHeckle(heckle)}>{heckle}</Heckle>) }
			<br/>
			<InputContainer>
				<input type="text" onChange={(ev) => setText(ev.target.value)} value={text} onKeyDown={handleKey} ></input>
				{text.length > 0 && <ClearButton onClick={() => setText("")}>x</ClearButton>}
			</InputContainer>
			<br/>
			<Button variant="contained" onClick={() => {
				sendHeckle(text);
				setText("");
			}} >
				Say it
			</Button>
		</CenterDiv>
	</HecklerDiv>;
}

export default HecklerView;
