import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { emit } from '../SocketInterface';
import { useGameStore } from '../store/GameStore';
import { CalibrationMode } from '../types/GameTypes';
import { SocketEvent } from '../types/SocketTypes';
import DartBoard from './DartBoard';

const StartScreenDiv = styled.div`
    height: 100%;
	width: 100%;
    display: flex;
	flex-direction: column;
    align-items: center;
    place-content: center;
	gap: 50px;
`;

const Title = styled.div`
	font-size: 30px;
`;


function CalibrationScreen() {
	const calibrationMode = useGameStore(store => store.calibrationMode);

	const startCalibration = () => {
		emit(SocketEvent.SET_CALIBRATION_STEP, 0);
	}

	return (
		<StartScreenDiv>
			<Title>
				{CalibrationMode[calibrationMode ?? 0]} Calibration
			</Title>
			<Button variant='contained' onClick={startCalibration}>
				Start Calibration
			</Button>
			<DartBoard />
		</StartScreenDiv>
	);
}

export default CalibrationScreen;



