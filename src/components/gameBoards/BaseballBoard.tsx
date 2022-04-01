import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/GameStore';
import { playSound } from '../../tools/AudioTools';
import { Base, DartThrow } from '../../types/GameTypes';
import SmallScoreBoard from './SmallScoreBoard';

const BaseballRoot = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	flex-grow: 1;
`;
const Field = styled.div`
	background: green;
	width: 300px;
	height: 300px;
	position: relative;
	overflow: hidden;
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
	transition: left 500ms ease-in-out, bottom 500ms ease-in-out;
    text-align: center;
    line-height: 18px;
`;

const getPos = (base: Base, offset: number): { left: string, bottom: string } => {
	// Dugout
	let pos = { left: 60 + offset, bottom: 0 };
	if (base === Base.AtBat) pos = { left: 50, bottom: 20 };
	if (base === Base.Home) pos = { left: 50, bottom: 20 };
	if (base === Base.First) pos = { left: 80, bottom: 50 };
	if (base === Base.Second) pos = { left: 50, bottom: 80 };
	if (base === Base.Third) pos = { left: 20, bottom: 50 };
	if (base >= Base.Dugout) pos = { left: 40 - offset, bottom: 0 };
	return {
		left: pos.left + "%",
		bottom: pos.bottom + "%",
	};
}


const initialBases: Base[] = [];
for (let i=0; i<3; i++) initialBases.push(Base.OnDeck);


function BaseballBoard() {
	const dartThrows = useGameStore(store => store.dartThrows);
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const currentRound = useGameStore(store => store.currentRound);
	const currentPlayer = players[currentPlayerIndex];


	const [ roundDarts, setRoundDarts ] = useState<DartThrow[]>([]);
	const [ runnerSnapshots, setRunnerSnapshots ] = useState<number[][]>([]);
	const [ snapshotIndex, setSnapshotIndex ] = useState(0);

	useEffect(() => {
		//console.log("new dartThrows");
		setRoundDarts(dartThrows.filter(({ player, round }) => player === currentPlayer && round === currentRound));

		if (dartThrows.slice(-1)?.[0]?.totalScore)
			playSound("sounds/baseball.mp3", 0.5);
		
	}, [currentPlayer, currentRound, dartThrows]);
	
	useEffect(() => {
		if (snapshotIndex + 1 < runnerSnapshots.length)
			setTimeout(() => {
				setSnapshotIndex(snapshotIndex + 1);
			}, 500);
	}, [runnerSnapshots, snapshotIndex]);

	
	useEffect(() => {
		
		const snapShots: number[][] = [];
		const totalPos = [-1, -1, -1];
		snapShots.push([ ...totalPos ]);
		for (let i=0; i<3; i++) {
			const roundScore = roundDarts[i]?.totalScore;
			if (roundScore === 0)
				totalPos[i] = -2;
			else {
				if (i <= roundDarts.length) {
					totalPos[i] += 1;
					snapShots.push([ ...totalPos ]);
				}
				for (let r = 0; r < roundScore; r++) {
					for (let y=0; y<=i; y++)
						if (totalPos[y] >= -1 && totalPos[y] < Base.Dugout) {
							totalPos[y] += 1;
					}
					snapShots.push([ ...totalPos ]);
				}
			}
			for (let x=0; x<=i; x++) {
				if (totalPos[x] === Base.Home) {
					totalPos[x] += 1;
					snapShots.push([ ...totalPos ]);
				}
			}
		}
		// console.log("snapShots", snapShots.map(t => t.map(prettyBase).join(",")));
		setRunnerSnapshots(snapShots);
		setSnapshotIndex(Math.min(snapshotIndex, snapShots.length - 1));

	}, [roundDarts, snapshotIndex]);

	const currentBases = runnerSnapshots[snapshotIndex] || [];

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
				{currentBases.map((base, i) => <RunnerDiv
					key={i}
					style={getPos(base, i * 10)}
				>
					{i + 1}
				</RunnerDiv>)}
			</Field>
		</BaseballRoot>
	);
}

export default BaseballBoard;
