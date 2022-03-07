import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import GameBaseball, { Base, getBaseName } from '../../gameTypes/GameBaseball';
import { DartThrow, useGameStore } from '../../store/GameStore';
import SmallScoreBoard from './SmallScoreBoard';

const BaseballRoot = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`;
const Field = styled.div`
	background: green;
	width: 300px;
	height: 300px;
	position: relative;
`;
const Infield = styled.div`
	background: #cc7d06b5;
	position: absolute;
	transform: translate(-50%) rotate(45deg);
	bottom: 20%;
	left: 50%;
	background: rgba(192, 117, 3);
	width: 70%;
	height: 70%;
`;
const LeftFoulLine = styled.div`
	position: absolute;
	transform: translate(-50%) rotate(-45deg);
	bottom: 9%;
	left: 25%;
	background: #fff;
	width: 2px;
	height: 210px;
`;
const RightFoulLine = styled(LeftFoulLine)`
	transform: translate(-50%) rotate(45deg);
	left: 75%;
`;
const HomeBase = styled.div`
	position: absolute;
	transform: translate(-50%) rotate(45deg);
	bottom: 20%;
	left: 50%;
	background: #fff;
	width: 13px;
	height: 13px;
`;
const FirstBase = styled(HomeBase)`
	bottom: 50%;
	left: 80%;
`;
const SecondBase = styled(FirstBase)`
	bottom: 80%;
	left: 50%;
`;
const ThirdBase = styled(FirstBase)`
	left: 20%;
`;
const RunnerDiv = styled(FirstBase)`
	position: absolute;
	transform: translate(-50%);
	background: #327aff;
	border-radius: 10px;
	width: 20px;
	height: 20px;
	transition: left 1000ms ease-in-out, bottom 1000ms ease-in-out;
	&.home {
		left: 50%;
		bottom: 20%;
	}
	&.first {
		left: 80%;
		bottom: 50%;
	}
	&.second {
		left: 50%;
		bottom: 80%;
	}
	&.third {
		left: 20%;
		bottom: 50%;
	}
	&.dugout {
		left: 60%;
		bottom: -10%;
	}
`;

interface Runner {
	base: Base;
	index: number;
}

function BaseballBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const currentRound = useGameStore(store => store.currentRound);
	const currentGame = useGameStore(store => store.currentGame);
	const gameBaseball = currentGame as GameBaseball;
	const currentPlayer = players[currentPlayerIndex];


	const [ roundDarts, setRoundDarts ] = useState<DartThrow[]>([]);
	const [ runners, setRunners ] = useState<Runner[]>([]);

	useEffect(() => {
		console.log("new dartThrows");
		setRoundDarts(dartThrows.filter(({ player, round }) => player === currentPlayer.name && round === currentRound));
	}, [currentPlayer.name, currentRound, dartThrows]);

	useEffect(() => {
		console.log("new round darts");
		const newRunners: Runner[] = [];
		for (let i=0; i < roundDarts.length; i++) {
			const dart = roundDarts[i];
			if (dart.totalScore) {
				// Advance runners
				newRunners.forEach((runner) => runner.base += dart.totalScore);
				const runner: Runner = {
					base: dart.totalScore,
					index: i,
				};
				newRunners.push(runner);
			}
		}
		//newRunners.((runner) => runner.base >= Base.Dugout);
		setRunners(newRunners);
		
	}, [roundDarts]);

	return (
		<BaseballRoot>
			<SmallScoreBoard />
			<Field>
				<Infield />
				<LeftFoulLine />
				<RightFoulLine />
				<HomeBase />
				<FirstBase />
				<SecondBase />
				<ThirdBase />
				{runners.map((runner, i) => <RunnerDiv key={runner.index} className={getBaseName(runner.base)} />)}
			</Field>
		</BaseballRoot>
	);
}

export default BaseballBoard;
