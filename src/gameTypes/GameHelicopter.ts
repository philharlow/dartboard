import { cloneDeep } from "lodash";
import ledManager from "../LedManager";
import { speak } from "../store/AudioStore";
import { DartThrow, useGameStore } from "../store/GameStore";
import { Player } from "../store/PlayerStore";
import { Hint, Ring } from "../types/LedTypes";
import GameType from "./GameType";


class GameHelicopter extends GameType {
	startingScore: number;
	throwsPerRound = 3;

	constructor(
		startingScore: number)
	{
		super({
			name: "Helicopter",
			minPlayers: 1,
			maxPlayers: 8,
			pronounciation: ("" + startingScore).replaceAll("0", "o"),
		});
		this.startingScore = startingScore;
	}

	getScore = (player: Player) => {
		const {
			dartThrows,
		} = useGameStore.getState();

		const darts = dartThrows.filter(t => t.player === player.name);
		const score = darts.reduce((score, dart) => score - dart.totalScore, this.startingScore);
		return score;
	}
	
	addDartThrow = (player: string, score: number, ring: Ring) => {
		const { dartThrows, setDartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, finishGame, winningPlayerIndex } = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		console.log("addDartThrow", score, ring, player);
		
		ledManager.flashLed(score, ring);
		if (!players.length || winningPlayerIndex !== undefined) {
			return;
		}
		if (!waitingForThrow) {
			speak("remove darts and hit next player", true);
			return;
		}

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.geMultiplier(ring);
		const totalScore = score * multiplier;
		const newThrow: DartThrow = {
			player,
			score,
			ring,
			multiplier,
			totalScore,
			round: currentRound,
			bust: false,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer.name);
		
		const playerScore = this.getScore(currentPlayer) - totalScore;
		console.log("playerscore will be", playerScore);

		const scoreMessage = ring === Ring.Miss ? " miss" : this.getSpokenScore(score, ring);
		speak(scoreMessage, true);
		
		// Winner!
		if (playerScore === 0) {
			speak("Well done!. " + currentPlayer.name + " wins!");
			finishGame(currentPlayerIndex);
			ledManager.doSolidWipe();
			return;
		}

		// Bust!
		if (playerScore < 0) {
			// Mark all darts this round as busts
			playerDarts.filter((d => d.round === currentRound)).forEach(dart => this.bustDart(dart));
			setDartThrows(clonedDarts);
			speak("Bust!!", true);
			this.roundEnded();
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();


		setDartThrows(clonedDarts);
		this.update();
	};

	bustDart = (dart: DartThrow) => {
		dart.bust = true;
		dart.totalScore = 0;
	}

	update = async () => {
		const {
			players,
			currentPlayerIndex,
		} = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];

		const score = this.getScore(currentPlayer);

		//console.log("updating", dartThrows)
		// All three darts
		if (score <= 60) {
			const hints: Hint[] = [];
			if (score === 25)
				hints.push({score: 25, ring: Ring.OuterBullseye });
			if (score === 50)
				hints.push({score: 25, ring: Ring.InnerBullseye });

			for (let i=1; i<=20; i++) {
				if (i === score) {
					hints.push({score: i, ring: Ring.InnerSingle });
					hints.push({score: i, ring: Ring.OuterSingle });
				}
				if (i * 2 === score)
					hints.push({score: i, ring: Ring.Double });
				if (i * 3 === score)
					hints.push({score: i, ring: Ring.Triple });
			}
			//console.log("hints", score, hints)
			ledManager.setHints(hints);
		}
	}

	getSpokenScore = (score: number, ring: Ring) => {
		if (ring === Ring.Miss) return "miss";
		if (ring === Ring.Triple) return "triple " + score;
		const scoreStr = score === 25 ? "bullseye" : ""+score;
		if (ring === Ring.Double || ring === Ring.InnerBullseye) return "double " + scoreStr;
		return scoreStr;
	}
	
	geMultiplier = (ring: Ring) => {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.InnerBullseye) return 2;
		return 1;
	}
}

export default GameHelicopter;