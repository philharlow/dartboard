import styled from '@emotion/styled/macro';
import { connectSocket } from '../SocketInterface';
import AudioDrawer from './AudioDrawer';
import SocketDrawer from './SocketDrawer';

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
			<StartButton onClick={() => connectSocket()} >
				<Title>
					Start
				</Title>
			</StartButton>
			<AudioDrawer />
			<SocketDrawer />
		</StartScreenDiv>
	);
}

export default GameSelectionScreen;




