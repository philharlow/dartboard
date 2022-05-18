import styled from '@emotion/styled/macro';
import { useGameStore } from '../../store/GameStore';

const TurnBoardDiv = styled.div`
    padding-right: 10px;
`;

const Title = styled.div`
	font-size: 46px;
	text-align: center;
	padding-bottom: 10px;
	border: 1px solid white;
	overflow: hidden;
	background: #0d0d0d6f;
`;

const TurnTable = styled.div`
	display: flex;
	flex-direction: row;
	align-self: center;
	text-align: center;
	font-size: 26px;
`;
const TurnColumn = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
    line-height: 32px;
	&.current {
		background: #fff3;
	}
`;
const ScoreCell = styled.div`
	text-align: center;
	width: 100px;
	height: 35px;
	padding: 5px;
	border: 1px solid white;
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
	const currentRound = useGameStore(store => store.currentRound);
	const currentPlayer = players[currentPlayerIndex];

	const playerDarts = dartThrows.filter(t => t.player === currentPlayer);
	const roundDarts = playerDarts.filter(t => t.round === currentRound);
	const turnTotal = roundDarts.reduce((acc, dart) => acc + dart.totalScore, 0);
	const bust = roundDarts.some(dart => dart.bust);
	const className = bust ? "bust": "";

	const dartsPerTurn = Math.max(3, roundDarts.length);

	const throws: JSX.Element[] = [];
	for (let i=1; i<=dartsPerTurn; i++)
		throws.push(<BoldCell key={i} className={className + (i === roundDarts.length ? " flash" : "")}>Throw {i}</BoldCell>);
	const scores: JSX.Element[] = [];
	for (let i=0; i<dartsPerTurn; i++)
		if (roundDarts[i]) {
			const scoreCellClass = className + (i+1 === roundDarts.length ? " flash" : "");
			scores.push(<ScoreCell key={i} className={scoreCellClass}>{roundDarts[i].display}</ScoreCell> );
		} else
			scores.push(<ScoreCell key={i}></ScoreCell> );

	return (
		<TurnBoardDiv>
			<Title className={waitingForThrow ? "waiting" : ""}>
				{currentPlayer}
			</Title>
			<TurnTable>
				<TurnColumn>
					{throws}
					<TotalCell>Total</TotalCell>
				</TurnColumn>
				<TurnColumn>
					{scores}
					<TotalCell>{turnTotal}</TotalCell>
				</TurnColumn>
			</TurnTable>
		</TurnBoardDiv>
	);
}

export default TurnBoard;
