import styled from '@emotion/styled/macro';
import Drawer, { DrawerPosition } from './Drawer';
import { Button, Switch } from '@mui/material';
import { useConnectionStore } from '../../store/ConnectionStore';
import { connectSocket } from '../../SocketInterface';


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

function SocketDrawer() {
	const socketConnected = useConnectionStore(store =>store.socketConnected);

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "12%"}} drawerStyle={{right: 0, width: 200, textAlign: "center", paddingBottom: 50}} tabLabel="Socket">
			<Title>
				Socket Connection
			</Title>
			<ColoredSwitch
				disabled
				checked={socketConnected}
				aria-label="Socket Connection"
				/>
			<br />
			<br />
			<Button disabled={socketConnected} variant='contained' onClick={() => connectSocket()}>
				Connect
			</Button>
		</Drawer>
	);
}

export default SocketDrawer;




