import styled from '@emotion/styled';
import GameType from '../gameTypes/GameType';
import { gameList, useGameStore } from '../store/GameStore';

const StartScreenDiv = styled.div`
    height: 100%;
	width: 100%;
`;

const Slider = styled.div`
	display: flex;
	flex-direction: row;
	
    height: 100%;
    align-items: center;
    text-align: center;
    overflow-x: auto;
	gap: 25px;
	padding: 0 50px;
`;

const GameButton = styled.div`
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
const Players = styled.div`
	font-size: 14px;
	padding-bottom: 20px;
`;


function GameSelectionScreen() {
	const startGame = useGameStore(store =>store.startGame);
	const selectGame = (currentGame: GameType) => {
		startGame(currentGame);
	}
	return (
		<StartScreenDiv>
			<Slider>
				{gameList.map(currentGame =>
					<GameButton
						key={currentGame.gameDef.name}
						onClick={() => selectGame(currentGame)}
						>
							<Title>
								{currentGame.gameDef.name}
							</Title>
							<Players>
								{currentGame.gameDef.minPlayers} - {currentGame.gameDef.maxPlayers} players
							</Players>
					</GameButton>)
				}
			</Slider>
		</StartScreenDiv>
	);
}

export default GameSelectionScreen;




