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

function SmallScoreBoard() {
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const currentGame = useGameStore(store => store.currentGame);
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
			<tbody>
				<ScoreRow>
					<BoldCell>Player</BoldCell>
					<BoldCell>Score</BoldCell>
				</ScoreRow>
				{players.map((player, i) => {
					const score = currentGame?.getScore(player);

					return <ScoreRow key={player.name} className={i === currentPlayerIndex ? "current" : ""} ref={i === currentPlayerIndex ? setCurrentDiv : null}>
							<ScoreCell>{player.name}</ScoreCell>
							<ScoreCell>{score}</ScoreCell>
						</ScoreRow>
				})}
			</tbody>
		</ScoresTable>
	);
}

export default SmallScoreBoard;
