import styled from '@emotion/styled/macro';
import { useGameStore } from '../../store/GameStore';
import { Ring } from '../../types/LedTypes';

const TurnTable = styled.div`
	display: flex;
	flex-direction: row;
	align-self: center;
	text-align: center;
    padding-right: 10px;
`;
const TurnColumn = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
	&.current {
		background: #fff3;
	}
`;
const ScoreCell = styled.div`
	text-align: center;
	width: 75px;
	height: 30px;
	padding: 5px;
	border: 1px solid white;
`;
const BoldCell = styled(ScoreCell)`
	font-weight: bold;
	text-align: left;
`;


function TurnBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentGame = useGameStore(store => store.currentGame);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const waitingForThrow = useGameStore(store => store.waitingForThrow);
	const round = Math.floor((dartThrows.length + (waitingForThrow ? 0 : -1)) / (players.length * 3)) ;
	const currentPlayer = players[currentPlayerIndex];

	const darts = dartThrows.filter(t => t.player === currentPlayer.name);
	const turnDarts = darts.slice(round * 3);
	const turnTotal = turnDarts.reduce((acc, dart) => acc + dart.totalScore, 0);
	const bust = turnDarts.some(dart => dart.bust);
	const className = bust ? "bust": "";

	const dartsPerTurn = currentGame?.throwsPerRound || 3;

	const throws: JSX.Element[] = [];
	for (let i=1; i<=dartsPerTurn; i++)
		throws.push(<BoldCell key={i} className={className + (i === turnDarts.length ? " flash" : "")}>Throw {i}</BoldCell>);
	const scores: JSX.Element[] = [];
	for (let i=0; i<dartsPerTurn; i++)
		if (turnDarts[i]) {
			const scoreCellClass = className + (i+1 === turnDarts.length ? " flash" : "");
			if (turnDarts[i].ring === Ring.Miss)
				scores.push(<ScoreCell key={i} className={scoreCellClass}>Miss</ScoreCell> );
			else
				scores.push(<ScoreCell key={i} className={scoreCellClass}>{turnDarts[i].multiplier} x {turnDarts[i].score}</ScoreCell> );
		} else
			scores.push(<ScoreCell key={i}></ScoreCell> );

	return (
		<TurnTable>
			<TurnColumn>
				<BoldCell>Player</BoldCell>
				{throws}
				<BoldCell>Total</BoldCell>
			</TurnColumn>
			<TurnColumn>
				<BoldCell>{currentPlayer.name}</BoldCell>
				{scores}
				<BoldCell>{turnTotal}</BoldCell>
			</TurnColumn>
		</TurnTable>
	);
}

export default TurnBoard;
