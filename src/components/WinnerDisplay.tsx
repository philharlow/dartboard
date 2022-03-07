import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useGameStore } from '../store/GameStore';

const BlurBackground = styled.div`
	position: absolute;
	top: 0%;
	bottom: 0%;
	right: 0%;
	left: 0%;
	backdrop-filter: blur(7px);
`;
const WinnerOverlay = styled.div`
    position: absolute;
    top: 10%;
	bottom: 10%;
    right: 10%;
    left: 10%;
	display: flex;
	flex-direction: column;
	background: #ccca;
	border-radius: 10px;
    align-items: center;
	justify-content: space-evenly;
`;
const Title = styled.div`
	font-size: 48px;
	font-weight: bold;
	text-align: left;
`;
const Icon = styled.div`
	font-size: 72px;
`;
const ButtonRow = styled.div`
	display: flex;
	flex-direction: row;
	gap: 20px;
`;
const FinalScoresTable = styled.table`
	border: 1px white solid;
  	border-collapse: collapse;
    table-layout: fixed;
	th {
		border: 1px white solid;
		width: 70px;
	}
`;

const CloseButton = styled.div`
	position: absolute;
	top: 5px;
	right: 5px;
	width: 25px;
	height: 25px;
	background: #955a;
	border-radius: 20px;
    text-align: center;
    line-height: 19px;
	z-index: 1000;
`;

const getPrettyPlace = (place: number) => {
	if (place === 1) return "1st";// "🥇";
	if (place === 2) return "2nd";// "🥈";
	if (place === 3) return "3rd";// "🥉";
	return place + "th";
}

function WinnerDisplay() {
	const [ hidden, setHidden ] = useState(false);
	const selectGame = useGameStore(store => store.selectGame);
	const currentGame = useGameStore(store => store.currentGame);
	const players = useGameStore(store => store.players);
	const winningPlayerIndex = useGameStore(store => store.winningPlayerIndex);
	const finalScores = currentGame!.getFinalScores();
	
	if (hidden)
		return null;

	return (
		<BlurBackground>
			<WinnerOverlay>
				<CloseButton onClick={() => setHidden(true)}>x</CloseButton>
				<Icon>
					🏆
				</Icon>
				<Title>
					{players[winningPlayerIndex!].name} Wins!
				</Title>
				<FinalScoresTable>
					<tbody>
						<tr>
							{finalScores.map((place, i) => <th key={i}>{getPrettyPlace(place.place)}</th>)}
						</tr>
						<tr>
							{finalScores.map((place, i) => <th key={i}>{place.player.name}</th>)}
						</tr>
						<tr>
							{finalScores.map((place, i) => <th key={i}>{place.score}</th>)}
						</tr>
					</tbody>
				</FinalScoresTable>
				<ButtonRow>
					<Button variant='contained' onClick={() => currentGame?.undoLastDart()}>
						Undo
					</Button>
					<Button variant='contained' onClick={() => selectGame(undefined)}>
						Change Game
					</Button>
					<Button variant='contained' onClick={() => selectGame(currentGame)}>
						Replay Game
					</Button>
				</ButtonRow>
			</WinnerOverlay>
		</BlurBackground>
	);
}

export default WinnerDisplay;
