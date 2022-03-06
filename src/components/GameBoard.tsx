import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useGameStore } from '../store/GameStore';
import { Ring } from '../types/LedTypes';
import BackButton from './BackButton';
import Scores from './Scores';
import TurnDisplay from './TurnDisplay';
import WinnerDisplay from './WinnerDisplay';

const GameTypeDisplay = styled.div`
  position: absolute;
  top: 10px;
  left: 100px;
  font-size: 24px;
`;
const NextPlayerButton = styled(Button)`
	position: absolute;
	left: 90%;
	bottom: 50px;
	font-size: 26px;
	transform: translate(-50%);
	background-color: #6a6a;
	border-radius: 10px;
`;
const MissButton = styled(Button)`
	position: absolute;
	left: 70%;
	bottom: 50px;
	font-size: 26px;
	transform: translate(-50%);
	background-color: #d6422faa;
	border-radius: 10px;
`;
const UndoButton = styled(Button)`
	position: absolute;
	left: 50%;
	bottom: 50px;
	font-size: 26px;
	transform: translate(-50%);
	background-color: #d6422faa;
	border-radius: 10px;
`;

function GameBoard() {
  const currentGame = useGameStore(store => store.currentGame);
  const startGame = useGameStore(store => store.startGame);
  const dartThrows = useGameStore(store => store.dartThrows);
  const players = useGameStore(store => store.players);
  const waitingForThrow = useGameStore(store => store.waitingForThrow);
  const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
  const winningPlayerIndex = useGameStore(store => store.winningPlayerIndex);

  const addMiss = () => {
    currentGame?.addDartThrow(players[currentPlayerIndex].name, 0, Ring.Miss);
  }

  return (
    <>
		<Scores />
		<TurnDisplay />
		<GameTypeDisplay>{ currentGame?.name }</GameTypeDisplay>
		<BackButton onClick={() => startGame(undefined)} />
		<NextPlayerButton
			disabled={waitingForThrow}
			variant="contained"
			onClick={() => currentGame?.nextPlayer()}
		>
			Next Player
		</NextPlayerButton>
		<MissButton
			disabled={!waitingForThrow || winningPlayerIndex !== undefined}
			variant="contained"
			onClick={() => addMiss()}
		>
			Miss
		</MissButton>
		<UndoButton
			disabled={dartThrows.length % 3 === 0 && waitingForThrow}
			variant="contained"
			onClick={() => currentGame?.undoLastDart()}
		>
			Undo
		</UndoButton>
      	{winningPlayerIndex !== undefined && <WinnerDisplay />}
    </>
  );
}

export default GameBoard;
