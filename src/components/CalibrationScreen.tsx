import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { emit } from '../SocketInterface';
import { useGameStore } from '../store/GameStore';
import { CalibrationMode, getSpokenScore } from '../types/GameTypes';
import { calibrationOrder, SocketEvent } from '../types/SocketTypes';
import DartBoard from './DartBoard';

const CalibrationScreenDiv = styled.div`
	margin: 30px;
	flex: 1;
	width: 100%;
    display: flex;
	flex-direction: column;
    align-items: center;
    place-content: space-evenly;
    justify-content: space-evenly;
`;

const Title = styled.div`
	font-size: 30px;
`;
const CalibrationHint = styled.div`
	font-size: 16px;
	text-align: center;
`;
const CalibrationStep = styled.div`
	font-size: 20px;
`;


function CalibrationScreen() {
	const calibrationState = useGameStore(store => store.calibrationState);

	const startCalibration = () => {
		emit(SocketEvent.SET_CALIBRATION_STEP, 0);
	}

	return (
		<CalibrationScreenDiv>
			<Title>
				{CalibrationMode[calibrationState?.mode ?? 0]} Calibration
			</Title>
			<CalibrationHint>
				{calibrationState?.step === null && 
					<Button variant='contained' onClick={startCalibration}>
						Start Calibration
					</Button>
				}
				{calibrationState?.step !== null && 
				<>
					<CalibrationStep>Step {(calibrationState?.step ?? 0) + 1} / {calibrationOrder.length}</CalibrationStep>
					{calibrationState?.mode === CalibrationMode.Leds && <CalibrationHint>Press the lit up segment on the dartboard</CalibrationHint>}
					{calibrationState?.mode === CalibrationMode.Dartboard && <CalibrationHint>Press {getSpokenScore(calibrationOrder[calibrationState?.step ?? 0])} on the dartboard</CalibrationHint>}
				</>}
			</CalibrationHint>
			<DartBoard />
		</CalibrationScreenDiv>
	);
}

export default CalibrationScreen;




