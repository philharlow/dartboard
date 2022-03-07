import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import Game301 from '../../gameTypes/Game301';
import { DartThrow, useGameStore } from '../../store/GameStore';

const ScoresTable = styled.table`
	border: 1px solid white;
    border-collapse: collapse;
	flex-grow: 0;
    margin: 10px;
`;
const ScoreRow = styled.tr`
	&.current {
		background: #fff3;
	}
`;
const ScoreCell = styled.th`
	min-width: 50px;
	padding: 5px;
	text-align: center;
	border: 1px solid white;
`;
const BoldCell = styled(ScoreCell)`
	font-weight: bold;
	text-align: left;
`;

const ThrowDetails = styled.div`
	width: 70px;
	display: flex;
	align-items: center;
    justify-content: space-between;
`;

const ThrowList = styled.div`
	width: 30px;
	display: flex;
	flex-direction: column;
    font-weight: normal;
    border-collapse: collapse;
`;
const ThrowCell = styled.div`
	height: 12px;
	font-size: 10px;
	border: 1px solid white;
`;

function ScoreBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const currentRound = useGameStore(store => store.currentRound);
	const currentGame = useGameStore(store => store.currentGame);
	const game301 = currentGame as Game301;

	const [ currentDiv, setCurrentDiv ] = useState<HTMLDivElement | null>(null);

	useEffect(() => {
		currentDiv?.scrollIntoView({
			behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
	}, [currentDiv]);

	const scores: Record<string, number> = {};
	const dartsPerRound: Record<string, DartThrow[][]> = {};
	players.forEach(player => {
		const playerScore = game301.getScore(player);
		scores[player.name] = playerScore;
		
		const playerDarts = dartThrows.filter(t => t.player === player.name);
		const dartsByRound: DartThrow[][] = [];
		for (let i=0; i<=currentRound; i++) {
			const roundDarts = playerDarts.filter(t => t.round === i);
			dartsByRound[i] = roundDarts;
		}
		dartsPerRound[player.name] = dartsByRound;
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
		for (let i=0; i<game301.throwsPerRound; i++)
			throwCells.push(getThrowCell(i, darts[i]));
		
		const ref = currentCell ? { ref: setCurrentDiv } : { }
		return <ScoreCell key={i}>
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
					<BoldCell>Player</BoldCell>
					<BoldCell>Score</BoldCell>
					{rounds}
				</ScoreRow>
				{players.map((player, i) => {
					const score = scores[player.name];
					const dartsByRound = dartsPerRound[player.name];

					return <ScoreRow key={player.name} className={i === currentPlayerIndex ? "current" : ""}>
							<ScoreCell>{player.name}</ScoreCell>
							<ScoreCell>{score}</ScoreCell>
							{dartsByRound.map((darts, d) => getTurnCell(darts, d, i === currentPlayerIndex && d === currentRound))}
						</ScoreRow>
				})}
			</tbody>
		</ScoresTable>
	);
}

export default ScoreBoard;
