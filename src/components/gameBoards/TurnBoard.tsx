import styled from '@emotion/styled/macro';
import { useGameStore } from '../../store/GameStore';
import { Ring } from '../../types/LedTypes';

const RootDiv = styled.div`
    padding-right: 10px;
`;

const Title = styled.div`
	font-size: 36px;
	text-align: center;
	padding-bottom: 10px;
	border: 1px solid white;
	overflow: hidden;
	background: #fff3;
`;

const TurnTable = styled.div`
	display: flex;
	flex-direction: row;
	align-self: center;
	text-align: center;
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
    line-height: 26px;
`;
const BoldCell = styled(ScoreCell)`
	font-weight: bold;
`;
const TotalCell = styled(ScoreCell)`
	font-weight: bold;
	background: #fff2;
`;


function TurnBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const waitingForThrow = useGameStore(store => store.waitingForThrow);
	const round = Math.floor((dartThrows.length + (waitingForThrow ? 0 : -1)) / (players.length * 3)) ;
	const currentPlayer = players[currentPlayerIndex];

	const darts = dartThrows.filter(t => t.player === currentPlayer);
	const turnDarts = darts.slice(round * 3);
	const turnTotal = turnDarts.reduce((acc, dart) => acc + dart.totalScore, 0);
	const bust = turnDarts.some(dart => dart.bust);
	const className = bust ? "bust": "";

	const dartsPerTurn = 3;

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
		<RootDiv>
			<Title>
				{currentPlayer}
			</Title>
			<TurnTable>
				<TurnColumn>
					<BoldCell>Player</BoldCell>
					{throws}
					<TotalCell>Total</TotalCell>
				</TurnColumn>
				<TurnColumn>
					<BoldCell>Throw</BoldCell>
					{scores}
					<TotalCell>{turnTotal}</TotalCell>
				</TurnColumn>
			</TurnTable>
		</RootDiv>
	);
}

export default TurnBoard;
