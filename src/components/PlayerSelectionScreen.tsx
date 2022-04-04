import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useGameStore } from '../store/GameStore';
import { usePlayerStore } from '../store/PlayerStore';
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
	gap: 15px;
	padding: 0 50px;
`;
const PlayerButton = styled.div`
	width: 200px;
	height: 200px;
	background: #0d0d0d61;
	flex-shrink: 0;
    display: flex;
	flex-direction: column;
    align-items: center;
    justify-content: center;
	font-size: 40px;
	//max-height: 100%;
	&.selected {
		background: #6a6a;
	}
`;
const GameTitle = styled.div`
	font-size: 46px;
	text-align: center;
	left: 50%;
	top: 40px;
	transform: translate(-50%);
	position: absolute;
`;
const GamePlayers = styled.div`
	font-size: 26px;
`;
const NextButton = styled(Button)`
	position: fixed;
	right: 10px;
	bottom: 10px;
	font-size: 26px;
	padding: 30px 40px;
	font-size: 40px;
	background: #6a6a;
	border-radius: 10px;
`;
const PlayerNumber = styled.div`
	font-size: 26px;
`;


function PlayerSelectionScreen() {
	const currentGame = useGameStore(store => store.gameList?.find(game => game.gameType === store.currentGameType));
	const currentGameName = useGameStore(store => store.currentGameName);
	const setSelectedSettings = useGameStore(store => store.setSelectedSettings);
	const setPlayers = useGameStore(store => store.setPlayers);
	const allPlayers = usePlayerStore(store => store.allPlayers);
	const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
	const togglePlayer = (player: string) => {
		if (selectedPlayers.includes(player))
			setSelectedPlayers(selectedPlayers.filter(p => p !== player));
		else
			setSelectedPlayers([ ...selectedPlayers, player ]);
	};

	const validNumPlayers = currentGame && selectedPlayers.length >= currentGame.minPlayers && selectedPlayers.length <= currentGame.maxPlayers;


	return (
		<RootDiv>
			<GameTitle>
				{currentGameName || currentGame?.name}
				<GamePlayers>
					{currentGame?.minPlayers} - {currentGame?.maxPlayers} players
				</GamePlayers>
			</GameTitle>
			<Slider>
				{allPlayers?.map((player) => (
					<PlayerButton
						key={player.name}
						onClick={() => togglePlayer(player.name)}
						className={selectedPlayers.includes(player.name) ? "selected" : ""}
						>
							{selectedPlayers.includes(player.name) && (
								<PlayerNumber>
									# {selectedPlayers.indexOf(player.name) + 1}
								</PlayerNumber>
							)}
							{player.name}
					</PlayerButton>
				))}
			</Slider>
			<BackButton onClick={() => setSelectedSettings([])} />
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




