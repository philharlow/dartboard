import Drawer, { DrawerPosition } from './Drawer';
import { Button, Switch } from '@mui/material';
import { emit } from '../../SocketInterface';
import { SocketEvent } from '../../types/SocketTypes';
import styled from '@emotion/styled/macro';
import { useGameStore } from '../../store/GameStore';
import { useConnectionStore } from '../../store/ConnectionStore';


const Title = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
	text-align: center;
`;
const Subtitle = styled.div`
	font-size: 20px;
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
const Row = styled.div`
	display: flex;
	flex-direction: row;
`;
const Col = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
    align-items: center;
    text-align: center;
    align-self: end;
`;


function SettingsDrawer() {

	const ledsConnected = useGameStore(store => store.connections.leds);
	const dartboardConnected = useGameStore(store => store.connections.dartboard);
	const socketConnected = useConnectionStore(store => store.socketConnected);

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
			<Subtitle>
				Connections
			</Subtitle>
			<Row>
				<Col>
					Socket
					<ColoredSwitch
						disabled
						checked={socketConnected}
						aria-label="Socket Connected"
						/>
				</Col>
				<Col>
					LEDs
					<ColoredSwitch
						disabled
						checked={ledsConnected && socketConnected}
						aria-label="LEDs Connected"
						/>
				</Col>
				<Col>
					Dartboard
					<ColoredSwitch
						disabled
						checked={dartboardConnected && socketConnected}
						aria-label="Dartboard Connected"
						/>
				</Col>
			</Row>
			<Subtitle>
				Calibration
			</Subtitle>
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




