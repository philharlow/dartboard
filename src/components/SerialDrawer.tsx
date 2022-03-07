import styled from '@emotion/styled/macro';
import Drawer, { DrawerPosition } from './Drawer';
import { Button, Switch } from '@mui/material';
import { connectSerial, writeToSerial } from '../SerialInterface';
import { useConnectionStore } from '../store/ConnectionStore';


const Title = styled.div`
	font-weight: bold;
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

function SerialDrawer() {
	const serialConnected = useConnectionStore(store =>store.serialConnected);

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{left: "85%"}} drawerStyle={{right: 0, width: 200, textAlign: "center", paddingBottom: 50}} tabLabel="Serial">
			<Title>
				Serial Connection
			</Title>
			<ColoredSwitch
				disabled
				checked={serialConnected}
				aria-label="Serial Connection"
				/>
			<br />
			<br />
			<Button variant='contained' onClick={() => connectSerial()}>
				Connect
			</Button>
			<br />
			<br />
			<Button disabled={!serialConnected} variant='contained' onClick={() => writeToSerial(["yay!"])}>
				Send something
			</Button>
		</Drawer>
	);
}

export default SerialDrawer;




