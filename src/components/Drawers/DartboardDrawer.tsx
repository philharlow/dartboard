import Drawer, { DrawerPosition } from './Drawer';
import DartBoard from '../DartBoard';
import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useLedStore } from '../../store/LedStore';
import { LedButton, Ring } from '../../types/LedTypes';
import { emit, sendDartThrow } from '../../SocketInterface';
import { SocketEvent } from '../../types/SocketTypes';

const ButtonRow = styled.div`
  display: flex;
  position: relative;
  height: 50px;
`;
const BoardButton = styled(Button)`
  position: absolute;
  transform: translateX(-50%);
  border-radius: 50px;
  font-size: 12px;
  width: 50px;
  height: 50px;
  color: #888;
	&.lit {
		color: #fff;
	}
`;
const UndoButton = styled(BoardButton)`
	left: 10%;
	background-color: #101f50;
	:enabled:hover {
		background-color: #101f50;
    }
	&.lit {
		background-color: #2a4cbb;
    	box-shadow: #2a4cbb 0px 0px 20px;
	}
`;
const MissButton = styled(BoardButton)`
	left: 30%;
	background-color: #47130c;
	:enabled:hover {
		background-color: #47130c;
    }
	&.lit {
		background-color: #cf3622;
    	box-shadow: #cf3622 0px 0px 20px;
	}
`;
const NextButton = styled(BoardButton)`
	left: 90%;
	background-color: #0c3a0c;
	:enabled:hover {
		background-color: #0c3a0c;
    }
	&.lit {
		background-color: #28c328;
    	box-shadow: #28c328 0px 0px 20px;
	}
`;


function DartboardDrawer() {
	const buttonLeds = useLedStore(store => store.buttonLeds);

	const undoLit = buttonLeds[LedButton.UNDO];
	const missLit = buttonLeds[LedButton.MISS];
	const nextLit = buttonLeds[LedButton.NEXT];
	
	const addMiss = () => {
		sendDartThrow(0, Ring.Miss);
	}
	const undoLastDart = () => {
		emit(SocketEvent.UNDO_LAST_DART);
	}
	const nextPlayer = () => {
		emit(SocketEvent.NEXT_PLAYER, true);
	}

	const getClassName = (lit: boolean) => lit ? 'lit' : "";

	
	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "185px"}} drawerStyle={{left: "25%"}} tabLabel="Board">
			<DartBoard />
			<ButtonRow>
				<UndoButton className={getClassName(undoLit)} variant="contained" onClick={undoLastDart}>
					Undo
				</UndoButton>
				<MissButton className={getClassName(missLit)} variant="contained" onClick={addMiss}>
					Miss
				</MissButton>
				<NextButton className={getClassName(nextLit)} variant="contained" onClick={nextPlayer}>
					Next
				</NextButton>
			</ButtonRow>
		</Drawer>
	);
}

export default DartboardDrawer;




