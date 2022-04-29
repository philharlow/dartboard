import Drawer, { DrawerPosition } from './Drawer';
import { Button, Switch } from '@mui/material';
import { emit } from '../SocketInterface';
import { SocketEvent } from '../types/SocketTypes';
import styled from '@emotion/styled/macro';
import { useGameStore } from '../store/GameStore';


const Title = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
	text-align: center;
`;
const ColoredSwitch = styled(Switch)`
	& .MuiSwitch-switchBase.Mui-checked {
		color: #fff;
	}
	& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track {
		background-color: #fff;
	}
`;

function SettingsDrawer() {

	const ledsConnected = useGameStore(store => store.connections.leds);
	const dartboardConnected = useGameStore(store => store.connections.dartboard);

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
			LEDs Connected
			<ColoredSwitch
				disabled
				checked={ledsConnected}
				aria-label="LEDs Connected"
				/>
			Dartboard Connected
			<ColoredSwitch
				disabled
				checked={dartboardConnected}
				aria-label="Dartboard Connected"
				/>
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




