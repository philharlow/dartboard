import Drawer, { DrawerPosition } from './Drawer';
import { Button } from '@mui/material';
import { emit } from '../../SocketInterface';
import { HeckleEvent, SocketEvent } from '../../types/SocketTypes';
import styled from '@emotion/styled/macro';
import { useAudioStore } from '../../store/AudioStore';
import { useState } from 'react';


const Title = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
	text-align: center;
`;

function HeckleDrawer() {
	const [ text, setText ] = useState("");
	const setVolume = useAudioStore(store => store.setVolume);

	const sendHeckle = () => {
		setVolume(0);
		emit(HeckleEvent.HECKLE, text);
	};

	return (
		<Drawer position={DrawerPosition.Bottom} tabStyle={{right: "50%"}} drawerStyle={{right: "50%"}} tabLabel="Heckle">
			<Title>
				Heckle
			</Title>
			<input type="text" onChange={(ev) => setText(ev.target.value)} value={text}></input>
			<Button variant="contained" onClick={sendHeckle} >
				Say it
			</Button>
		</Drawer>
	);
}

export default HeckleDrawer;




