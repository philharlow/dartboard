import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useGameStore } from '../store/GameStore';
import { Player, usePlayerStore } from '../store/PlayerStore';
import BackButton from './BackButton';

const RootDiv = styled.div`
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
	gap: 5px;
	padding: 0 50px;
`;
const PlayerButton = styled.div`
	width: 200px;
	height: 200px;
	background: #cccccc77;
	flex-shrink: 0;
    display: flex;
	flex-direction: column;
    align-items: center;
    justify-content: center;
	font-size: 20px;
	//max-height: 100%;
	&.selected {
		background: #6a6a;
	}
`;
const GameTitle = styled.div`
	font-size: 26px;
	text-align: center;
	left: 50%;
	top: 40px;
	transform: translate(-50%);
	position: absolute;
`;
const GamePlayers = styled.div`
	font-size: 16px;
`;
const NextButton = styled(Button)`
	position: absolute;
	right: 30px;
	bottom: 50px;
	font-size: 26px;
	padding: 15px 25px;
	background: #6a6a;
	border-radius: 10px;
`;
const PlayerNumber = styled.div`
	font-size: 26px;
`;


function PlayerSelectionScreen() {
	const currentGame = useGameStore(store =>store.currentGame);
	const selectGame = useGameStore(store =>store.selectGame);
	const setPlayers = useGameStore(store =>store.setPlayers);
	const players = usePlayerStore(store =>store.players);
	const [ selectedPlayers, setSelectedPlayers ] = useState<Player[]>([]);
	const togglePlayer = (player: Player) => {
		if (selectedPlayers.includes(player))
			setSelectedPlayers(selectedPlayers.filter(p => p.name !== player.name));
		else
			setSelectedPlayers([ ...selectedPlayers, player ]);
	};

	const validNumPlayers = currentGame && selectedPlayers.length >= currentGame.gameDef.minPlayers && selectedPlayers.length <= currentGame.gameDef.maxPlayers;


	return (
		<RootDiv>
			<GameTitle>
				{currentGame?.name}
				<GamePlayers>
					{currentGame?.gameDef.minPlayers} - {currentGame?.gameDef.maxPlayers} players
				</GamePlayers>
			</GameTitle>
			<Slider>
				{players.map((player) => (
					<PlayerButton
						key={player.name}
						onClick={() => togglePlayer(player)}
						className={selectedPlayers.includes(player) ? "selected" : ""}
						>
							{selectedPlayers.includes(player) && (
								<PlayerNumber>
									# {selectedPlayers.indexOf(player) + 1}
								</PlayerNumber>
							)}
							{player.name}
					</PlayerButton>
				))}
			</Slider>
			<BackButton onClick={() => selectGame(undefined)} />
			<NextButton
				disabled={!validNumPlayers}
				variant="contained"
				onClick={() => validNumPlayers && setPlayers(selectedPlayers)}
				>
				Start
			</NextButton>
		</RootDiv>
	);
}

export default PlayerSelectionScreen;




