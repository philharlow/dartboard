import Drawer, { DrawerPosition } from './Drawer';
import DartBoard from './DartBoard';
import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLedStore } from '../store/LedStore';
import { LedButton } from '../types/LedTypes';

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
		background-color:#2a4cbb;
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
		background-color:#cf3622
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
		background-color:#28c328;
    	box-shadow: #28c328 0px 0px 20px;
	}
`;


function DartboardDrawer() {
	const buttonLeds = useLedStore(store => store.buttonLeds);

	const [undoLit, setUndoLit] = useState(false);
	const [missLit, setMissLit] = useState(false);
	const [nextLit, setNextLit] = useState(false);

	const undo = () => {
		console.log('undo');
	};
	const miss = () => {
		console.log('miss');
	};
	const next = () => {
		console.log('next');
	};

	useEffect(() => {
		setUndoLit(buttonLeds[LedButton.UNDO]);
		setMissLit(buttonLeds[LedButton.MISS]);
		setNextLit(buttonLeds[LedButton.NEXT]);
	}, [buttonLeds]);


	const undoClassName = undoLit ? 'lit' : "";
	const missClassName = missLit ? 'lit' : "";
	const nextClassName = nextLit ? 'lit' : "";

	
	return (
		<Drawer position={DrawerPosition.Top} tabStyle={{right: "50%"}} drawerStyle={{left: "25%"}} tabLabel="Board">
			<DartBoard />
			<ButtonRow>
				<UndoButton className={undoClassName} variant="contained" onClick={undo}>
					Undo
				</UndoButton>
				<MissButton className={missClassName} variant="contained" onClick={miss}>
					Miss
				</MissButton>
				<NextButton className={nextClassName} variant="contained" onClick={next}>
					Next
				</NextButton>
			</ButtonRow>
		</Drawer>
	);
}

export default DartboardDrawer;




