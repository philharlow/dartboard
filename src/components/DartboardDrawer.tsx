import Drawer, { DrawerPosition } from './Drawer';
import DartBoard from './DartBoard';


function DartboardDrawer() {
	return (
		<Drawer position={DrawerPosition.Bottom} tabStyle={{left: "75%"}} drawerStyle={{left: "25%"}} tabLabel="Board">
			<DartBoard />
		</Drawer>
	);
}

export default DartboardDrawer;




