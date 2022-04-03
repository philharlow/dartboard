import Drawer, { DrawerPosition } from './Drawer';
import { Button } from '@mui/material';
import { emit } from '../SocketInterface';
import { SocketEvent } from '../types/SocketTypes';
import styled from '@emotion/styled/macro';


const Title = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
	text-align: center;
`;

function SettingsDrawer() {

	const clearCalibration = () => {
		if(window.confirm("Are you sure you want to clear calibrations?"))
			emit(SocketEvent.CLEAR_CALIBRATION, true);
	};

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "0%"}} drawerStyle={{right: "0%"}} tabLabel="⚙️">
			<Title>
				Settings
			</Title>
			<Button variant="contained" onClick={clearCalibration} >
				Clear Calibration
			</Button>
		</Drawer>
	);
}

export default SettingsDrawer;




