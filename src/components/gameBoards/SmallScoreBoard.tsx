import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/GameStore';

const ScoresTable = styled.table`
	align-self: center;
	border: 1px solid white;
    border-collapse: collapse;
	flex-grow: 1;
    align-self: flex-start;
    margin: 10px;
	font-size: 46px;
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
	font-size: 46px;
`;
const BoldCell = styled(ScoreCell)`
	font-weight: bold;
	text-align: left;
`;

function SmallScoreBoard() {
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const innings = useGameStore(store => store.selectedSettings?.find(s => s.name === "Innings")?.option ?? 9);
	const currentRound = useGameStore(store => store.currentRound);
	const scores = useGameStore(store => store.scores);
	const [ currentDiv, setCurrentDiv ] = useState<HTMLDivElement | null>(null);

	useEffect(() => {
		currentDiv?.scrollIntoView({
			behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
	}, [currentDiv]);

	return (
		<ScoresTable>
			{currentRound + 1}/{innings} inning
			<tbody>
				<ScoreRow>
					<BoldCell>Player</BoldCell>
					<BoldCell>Score</BoldCell>
				</ScoreRow>
				{players.map((player, i) => {
					const score = scores[i];

					return <ScoreRow key={player} className={i === currentPlayerIndex ? "current" : ""} ref={i === currentPlayerIndex ? setCurrentDiv : null}>
							<ScoreCell>{player}</ScoreCell>
							<ScoreCell>{score}</ScoreCell>
						</ScoreRow>
				})}
			</tbody>
		</ScoresTable>
	);
}

export default SmallScoreBoard;
