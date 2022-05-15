import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/GameStore';
import { DartThrow } from '../../types/GameTypes';

const ScoresTable = styled.table`
	border: 1px solid white;
    border-collapse: collapse;
	flex-grow: 0;
    margin: 10px;
	height: fit-content;
	font-size: 26px;
`;
const ScoreRow = styled.tr`
	&.current {
		background: #fff3;
	}
`;
const ScoreCell = styled.th`
	min-width: 100px;
	padding: 5px;
	text-align: center;
	border: 1px solid white;
`;
const BoldCell = styled(ScoreCell)`
	font-weight: bold;
	text-align: left;
`;

const ThrowDetails = styled.div`
	width: 120px;
	display: flex;
	align-items: center;
    justify-content: space-between;
`;

const ThrowList = styled.div`
	width: 60px;
	display: flex;
	flex-direction: column;
    font-weight: normal;
    border-collapse: collapse;
`;
const ThrowCell = styled.div`
	height: 20px;
	font-size: 20px;
	line-height: 20px;
	border: 1px solid #fff7;
`;
const FixedCell = styled(ScoreCell)`
	position: sticky;
	left: 10px;
	background: #0d0d0dc1;
`;
const FixedScoreCell = styled(ScoreCell)`
	position: sticky;
	font-size: 40px;
	left: 10px;
	height: 65px;
	line-height: 70px;
	background: #0d0d0dc1;
`;

function ScoreBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const waitingForThrow = useGameStore(store => store.waitingForThrow);
	const currentRound = useGameStore(store => store.currentRound);
	const scores = useGameStore(store => store.scores);

	const [ currentDiv, setCurrentDiv ] = useState<HTMLDivElement | null>(null);

	useEffect(() => {
		currentDiv?.scrollIntoView({
			behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
		// console.log("scrolling to", currentDiv)
	}, [currentDiv]);

	
	const dartsPerRound: Record<string, DartThrow[][]> = {};
	players.forEach(player => {
		const playerDarts = dartThrows.filter(t => t.player === player);
		const dartsByRound: DartThrow[][] = [];
		for (let i=0; i<=currentRound; i++) {
			const roundDarts = playerDarts.filter(t => t.round === i);
			dartsByRound[i] = roundDarts;
		}
		dartsPerRound[player] = dartsByRound;
	});

	const rounds: JSX.Element[] = [];
	for (let i=0; i<=currentRound; i++)
		rounds.push(<BoldCell key={i}>Round {i+1}</BoldCell>);

	const getThrowCell = (i: number, dart?: DartThrow) => {
		return <ThrowCell key={i}>
				{dart && dart.score > 0 && `${dart.multiplier} x ${dart.score}`}
				{dart && !dart.score && "Miss"}
				{!dart && ""}
			</ThrowCell>
	}

	const getTurnCell = (darts: DartThrow[], i: number, currentCell: boolean) => {
		const bust = darts.some(dart => dart.bust);
		const roundPoints = darts.reduce((acc, dart) => acc + dart.totalScore, 0);
		const shownScore = bust ? "Bust" : (darts.length ? roundPoints : "");
		const throwCells: JSX.Element[] = [];
		for (let i=0; i<3; i++)
			throwCells.push(getThrowCell(i, darts[i]));
		
		const ref = currentCell ? { ref: setCurrentDiv } : { }
		return <ScoreCell key={i} className={currentCell ? "waiting" : ""}>
				<ThrowDetails { ...ref }>
					<ThrowList className={bust ? "bust" : ""}>
						{throwCells}
					</ThrowList>
					{shownScore}
				</ThrowDetails>
			</ScoreCell>
	}

	return (
		<ScoresTable>
			<tbody>
				<ScoreRow>
					<FixedCell>Player</FixedCell>
					<FixedCell style={{left: 120}}>Score</FixedCell>
					{rounds}
				</ScoreRow>
				{players.map((player, i) => {
					const score = scores[i];
					const dartsByRound = dartsPerRound[player];

					return <ScoreRow key={player} className={i === currentPlayerIndex ? "current" : ""}>
							<FixedScoreCell className={i === currentPlayerIndex && waitingForThrow ? "waiting" : ""}>{player}</FixedScoreCell>
							<FixedScoreCell style={{left: 120}}>{score}</FixedScoreCell>
							{dartsByRound.map((darts, d) => getTurnCell(darts, d, i === currentPlayerIndex && d === currentRound && waitingForThrow))}
						</ScoreRow>
				})}
			</tbody>
		</ScoresTable>
	);
}

export default ScoreBoard;
