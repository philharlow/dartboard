import styled from '@emotion/styled/macro';
import Drawer, { DrawerPosition } from './Drawer';
import { useGameStore } from '../store/GameStore';

const Title = styled.div`
	font-weight: bold;
	text-align: center;
`;
const ListItem = styled.div`
	
`;

function ThrowsDrawer() {
	const dartThrows = useGameStore(store =>store.dartThrows);

	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "110px"}} drawerStyle={{right: 0, width: 200, maxHeight: 200, overflowY: "auto"}} tabLabel="Throws">
			<Title>
				Throws
			</Title>
			{dartThrows.map(({ totalScore, score, multiplier, player, bust }, i) => {
				const throwStr = `#${i+1} ${player} - ${score ? `${totalScore} - ${multiplier}x${score}` : "miss"}`
				return <ListItem key={i} className={bust ? "bust" : ""}>
					{throwStr}
				</ListItem>;
			})}
		</Drawer>
	);
}

export default ThrowsDrawer;




