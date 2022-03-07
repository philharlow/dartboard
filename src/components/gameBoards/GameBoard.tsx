import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useGameStore } from '../../store/GameStore';
import { Ring } from '../../types/LedTypes';
import BackButton from '../BackButton';
import ScoreBoard from './ScoreBoard';
import TurnBoard from './TurnBoard';
import WinnerDisplay from '../WinnerDisplay';
import GameType, { addDartThrow } from '../../gameTypes/GameType';
import Game301 from '../../gameTypes/Game301';
import GameBaseball from '../../gameTypes/GameBaseball';
import BaseballBoard from './BaseballBoard';

const RootDiv = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	flex-grow: 1;
`;
const GameTypeDisplay = styled.div`
	font-size: 32px;
	padding: 10px;
	padding-left: 100px;
`;
const ContentRow = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	gap: 20px;
	flex-grow: 1;
	overflow: hidden;
`;
const ButtonRow = styled.div`
	display: flex;
	flex-direction: row;
	gap: 20px;
	justify-content: space-between;
	padding: 5px 10px;
`;
const NextPlayerButton = styled(Button)`
	font-size: 26px;
	background-color: #6a6a;
	border-radius: 10px;
	padding: 10px 20px;
`;
const MissButton = styled(Button)`
	font-size: 26px;
	background-color: #d6422faa;
	border-radius: 10px;
	padding: 10px 20px;
`;
const UndoButton = styled(Button)`
	font-size: 26px;
	background-color: #d6422faa;
	border-radius: 10px;
	padding: 10px 20px;
`;
const ScoreboardWrapper = styled.div`
	display: flex;
	flex-grow: 1;
	height: 100%;
	overflow: auto;
`;

const getScoreBoard = (game?: GameType) => {
	if (game instanceof GameBaseball) return BaseballBoard;
	if (game instanceof Game301) return ScoreBoard;
	return ScoreBoard;
}
const getTurnBoard = (game?: GameType) => {
	if (game instanceof Game301) return TurnBoard;
	return TurnBoard;
}

function GameBoard() {
  const currentGame = useGameStore(store => store.currentGame);
  const selectGame = useGameStore(store => store.selectGame);
  const dartThrows = useGameStore(store => store.dartThrows);
  const waitingForThrow = useGameStore(store => store.waitingForThrow);
  const winningPlayerIndex = useGameStore(store => store.winningPlayerIndex);

  const addMiss = () => {
    addDartThrow(0, Ring.Miss);
  }

  const ScoreBoard = getScoreBoard(currentGame);
  const TurnBoard = getTurnBoard(currentGame);
  return (
    <RootDiv>
		<GameTypeDisplay>{ currentGame?.name }</GameTypeDisplay>
		<ContentRow>
			<ScoreboardWrapper>
				<div>
					<ScoreBoard />
				</div>
			</ScoreboardWrapper>
			<TurnBoard />
		</ContentRow>
		<ButtonRow>
			<UndoButton
				disabled={dartThrows.length % 3 === 0 && waitingForThrow}
				variant="contained"
				onClick={() => currentGame?.undoLastDart()}
			>
				Undo
			</UndoButton>
			<MissButton
				disabled={!waitingForThrow || winningPlayerIndex !== undefined}
				variant="contained"
				onClick={() => addMiss()}
			>
				Miss
			</MissButton>
			<NextPlayerButton
				disabled={waitingForThrow}
				variant="contained"
				onClick={() => currentGame?.nextPlayer()}
			>
				Next Player
			</NextPlayerButton>
		</ButtonRow>
		<BackButton onClick={() => selectGame(undefined)} />
      	{winningPlayerIndex !== undefined && <WinnerDisplay />}
    </RootDiv>
  );
}

export default GameBoard;
