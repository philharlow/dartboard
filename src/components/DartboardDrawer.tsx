import Drawer, { DrawerPosition } from './Drawer';
import DartBoard from './DartBoard';


function DartboardDrawer() {
	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "32%"}} drawerStyle={{left: "25%"}} tabLabel="Board">
			<DartBoard />
		</Drawer>
	);
}

export default DartboardDrawer;




