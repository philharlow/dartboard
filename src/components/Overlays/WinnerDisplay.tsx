import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { emit } from '../../SocketInterface';
import { useGameStore } from '../../store/GameStore';
import { SocketEvent } from '../../types/SocketTypes';

const BlurBackground = styled.div`
	position: fixed;
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
	background: #4d4d4daa;
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
	font-size: 24px;
	th {
		border: 1px white solid;
		padding: 0px 30px;
	}
	td {
		border: 1px white solid;
		text-align: center;
	}
`;

const BaseButton = styled(Button)`
	font-size: 20px;
	border-radius: 10px;
	padding: 10px 20px;
`;
const ContinueButton = styled(BaseButton)`
	background-color: #6a6a;
	:enabled:hover {
		background-color: #6a6a;
    }
`;
const ChangeGameButton = styled(BaseButton)`
	background-color: #a6aa66aa;
	:enabled:hover {
		background-color: #a6aa66aa;
    }
`;
const ReplayButton = styled(BaseButton)`
	background-color: #8b2fd6aa;
	:enabled:hover {
		background-color: #8b2fd6aa;
    }
`;
const UndoButton = styled(BaseButton)`
	background-color: #24aee4aa;
	:enabled:hover {
		background-color: #24aee4aa;
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
	const [ hidden, setHidden ] = useState(true);
	const selectGame = useGameStore(store => store.selectGame);
	const currentGame = useGameStore(store => store.gameList?.find(game => game.gameType === store.currentGameType));
	const players = useGameStore(store => store.players);
	const winningPlayerIndex = useGameStore(store => store.winningPlayerIndex);
	const finalScores = useGameStore(store => store.finalScores);

	const undoLastDart = () => {
		emit(SocketEvent.UNDO_LAST_DART, true);
	}

	useEffect(() => {
		setHidden(finalScores.length === 0);
	}, [finalScores]);
	
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
					{players[winningPlayerIndex!]} Wins!
				</Title>
				<FinalScoresTable>
					<tbody>
						<tr>
							{finalScores.map((place, i) => <th key={i}>{getPrettyPlace(place.place)}</th>)}
						</tr>
						<tr>
							{finalScores.map((place, i) => <td key={i}>{place.playerName}</td>)}
						</tr>
						<tr>
							{finalScores.map((place, i) => <td key={i}>{place.score}</td>)}
						</tr>
					</tbody>
				</FinalScoresTable>
				<ButtonRow>
					<UndoButton variant='contained' onClick={() => undoLastDart()}>
						Undo
					</UndoButton>
					<ChangeGameButton variant='contained' onClick={() => selectGame(undefined)}>
						Change Game
					</ChangeGameButton>
					<ReplayButton variant='contained' onClick={() => selectGame(currentGame?.gameType)}>
						Replay Game
					</ReplayButton>
					<ContinueButton variant='contained' onClick={() => setHidden(true)}>
						Continue
					</ContinueButton>
				</ButtonRow>
			</WinnerOverlay>
		</BlurBackground>
	);
}

export default WinnerDisplay;
