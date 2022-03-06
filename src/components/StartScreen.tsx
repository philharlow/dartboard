import styled from '@emotion/styled';
import { connectSerial } from '../SerialInterface';
import AudioDrawer from './AudioDrawer';
import SerialDrawer from './SerialDrawer';

const StartScreenDiv = styled.div`
    height: 100%;
	width: 100%;
`;
const StartButton = styled.div`
	width: 200px;
	height: 200px;
	background: #cccccc77;
	flex-shrink: 0;
	border-radius: 15px;
    display: flex;
	flex-direction: column;
	gap: 30%;
    align-items: center;
	justify-content: flex-end;
	//max-height: 100%;
	&:active {
		background: #ccccccaa;
	}
`;


const Title = styled.div`
	font-size: 30px;
`;


function GameSelectionScreen() {
	return (
		<StartScreenDiv>
			<StartButton onClick={() => connectSerial()} >
				<Title>
					Start
				</Title>
			</StartButton>
			<AudioDrawer />
			<SerialDrawer />
		</StartScreenDiv>
	);
}

export default GameSelectionScreen;




