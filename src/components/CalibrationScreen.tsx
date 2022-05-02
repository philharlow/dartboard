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

	const step = calibrationState?.step ?? 0;
	// 2 extra for leds since the bullseys has 3 leds. Should find a better way to do this.
	const extraLeds = 2;
	const steps = calibrationState?.mode === CalibrationMode.Dartboard ? calibrationOrder.length : calibrationOrder.length + extraLeds;

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
					<CalibrationStep>Step {step + 1} / {steps}</CalibrationStep>
					{calibrationState?.mode === CalibrationMode.Dartboard && <CalibrationHint>Press {getSpokenScore(calibrationOrder[step])} on the dartboard</CalibrationHint>}
					{calibrationState?.mode === CalibrationMode.Leds && <CalibrationHint>Press the lit up segment on the dartboard</CalibrationHint>}
				</>}
			</CalibrationHint>
			{calibrationState?.mode === CalibrationMode.Dartboard && <DartBoard />}
		</CalibrationScreenDiv>
	);
}

export default CalibrationScreen;




