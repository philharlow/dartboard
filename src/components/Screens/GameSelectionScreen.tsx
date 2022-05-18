import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useGameStore } from '../../store/GameStore';
import { usePlayerStore } from '../../store/PlayerStore';
import { GameType } from '../../types/GameTypes';

const StartScreenDiv = styled.div`
    height: 100%;
	width: 100%;
    display: flex;
    align-items: center;
    place-content: center;
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
	width: 300px;
	height: 300px;
	background: #0d0d0d61;
	flex-shrink: 0;
	border-radius: 25px;
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
	font-size: 48px;
`;
const Players = styled.div`
	font-size: 24px;
	padding-bottom: 20px;
`;
const PlayersButton = styled(Button)`
	position: fixed;
	font-size: 20px;
	right: 20px;
	bottom: 20px;
	padding: 20px 30px;
	border-radius: 10px;
`;


function GameSelectionScreen() {
	const setGameType = useGameStore(store => store.setGameType);
	const gameList = useGameStore(store => store.gameList);
	const setEdittingPlayers = usePlayerStore(store => store.setEdittingPlayers);

	const startGame = (gameType: GameType) => {
		setTimeout(() => {
			setGameType(gameType);
		}, 100);
		//playSound("sounds/beeps/beep-tapped.aif")
	}

	return (
		<StartScreenDiv>
			<Slider>
				{gameList?.map(gameDef =>
					<GameButton
						key={gameDef.name}
						onClick={() => startGame(gameDef.gameType)}
						>
							<Title>
								{gameDef.name}
							</Title>
							<Players>
								{gameDef.minPlayers} - {gameDef.maxPlayers} players
							</Players>
					</GameButton>)
				}
			</Slider>
			<PlayersButton variant='contained' onClick={() => setEdittingPlayers(true)}>
				Edit Players
			</PlayersButton>
		</StartScreenDiv>
	);
}

export default GameSelectionScreen;




