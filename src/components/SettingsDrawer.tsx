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

	const clearDartCalibration = () => {
		if(window.confirm("Are you sure you want to clear dart calibrations?"))
			emit(SocketEvent.CLEAR_CALIBRATION, true);
	};
	const clearLEDCalibration = () => {
		if(window.confirm("Are you sure you want to clear led calibrations?"))
			emit(SocketEvent.CLEAR_CALIBRATION, false);
	};

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "0%"}} drawerStyle={{right: "0%"}} tabLabel="⚙️">
			<Title>
				Settings
			</Title>
			<Button variant="contained" onClick={clearDartCalibration} >
				Clear Dart Calibration
			</Button>
			<Button variant="contained" onClick={clearLEDCalibration} >
				Clear LED Calibration
			</Button>
		</Drawer>
	);
}

export default SettingsDrawer;




