import _, { cloneDeep } from "lodash";
import ledController from "../ledController";
import { DartThrow, GameType, SelectedSetting } from "../../src/types/GameTypes";
import { Hint, Ring } from "../../src/types/LedTypes";
import GameBase from "./gameBase";
import { showPopup, socketServer, speak } from "../socketServer";
import gameController from "../gameController";
import { SocketEvent } from "../../src/types/SocketTypes";

enum Game301InMode {
	ANY_IN = "Any In",
	DOUBLE_IN = "Double In",
	TRIPLE_IN = "Triple In"
};
enum Game301OutMode {
	ANY_OUT = "Any Out",
	DOUBLE_OUT = "Double Out",
	TRIPLE_OUT = "Triple Out"
};

class Game301 extends GameBase {
	startingScore = 0;
	inMode = Game301InMode.ANY_IN;
	outMode = Game301OutMode.ANY_OUT;
	

	constructor() {
		super({
			name: "301/X01",
			minPlayers: 1,
			maxPlayers: 8,
			pronounciation: ("3o1"),
			gameType: GameType.Game301,
			//settingsIntro: "Select your starting score",
			settingsOptions: [
				{
					name: "Starting Score",
					propName: "startingScore",
					options: [ 301, 501, 601, 701, 101 ],
					displaySuffix: "",
				},
				{
					name: "In Mode",
					propName: "inMode",
					options: Object.values(Game301InMode),
					displaySuffix: "",
				},
				{
					name: "Out Mode",
					propName: "outMode",
					options: Object.values(Game301OutMode),
					displaySuffix: "",
				}
			],
		});
	}

	hasPlayerWon(playerIndex: number): boolean {
		const { scores } = gameController.gameStatus;
		if (scores[playerIndex] === 0) return true;
		return false;
	}
	
	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		let score = this.startingScore;
		//const score = darts.reduce((score, dart) => score - dart.totalScore, this.startingScore);
		const roundDarts = darts.reduce<DartThrow[][]>((rounds, dart) => { rounds[dart.round] = [ ...rounds[dart.round] || [], dart ]; return rounds; }, []);
		roundDarts.forEach(round => {
			const bust = round.some(dart => dart.bust);
			if (!bust) {
				const roundScore = round.reduce((acc, dart) => acc + dart.totalScore, 0);
				score -= roundScore;
			}
		})

		return score;
	}

	getDisplayName(settings?: SelectedSetting[]) {
		return settings?.map(setting => setting.settingValue).join(", ") ?? this.gameDef.name;
	}

	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, waitingForThrow, currentRound, players, currentPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		// console.log("addDartThrow", score, ring, currentPlayer);
		
		ledController.flashLed(score, ring);
		if (!players.length) {
			return;
		}
		if (!waitingForThrow && ring !== Ring.Miss) {
			speak("remove darts and hit next player", true);
			return;
		}

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.getMultiplier(ring);
		const totalScore = score * multiplier;
		const newThrow: DartThrow = {
			player: currentPlayer,
			score,
			ring,
			multiplier,
			totalScore,
			round: currentRound,
			bust: false,
			display: score === 0 ? "Miss" : multiplier + " x " + score,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer);
		
		const playerScore = this.getScore(currentPlayer, dartThrows) - totalScore;
		// console.log("playerscore will be", playerScore);

		gameController.gameStatus.dartThrows.push(newThrow);
		const roundThrows = playerDarts.filter((d => d.round === currentRound));

		const roundScore = roundThrows.reduce((acc, t) => acc + t.totalScore, 0);
		const extra = roundScore > 100 ? (roundScore > 150 ? "., High Ton" : "., Low Ton") : "";
		const scoreMessage = ring === Ring.Miss ? " miss" : this.getSpokenScore(score, ring) + extra;
		speak(scoreMessage, true);

		// Bust!
		if (playerScore < 0) {
			newThrow.bust = true;
			newThrow.totalScore = 0;
			speak(scoreMessage + "! Bust!!", true);
         
			this.roundEnded();
		// Winner!
		} else if (playerScore === 0) {
			this.finishGame(currentPlayerIndex);
		// Thrown 3 darts
		} else if (roundThrows.length === this.throwsPerRound)
			this.roundEnded();

		const popupMessage = newThrow.ring === Ring.Miss ? "Miss" :
			(newThrow.bust ? "BUST " : "") + newThrow.multiplier + " x " + newThrow.score;
		showPopup(popupMessage);

		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		//setDartThrows(clonedDarts);
		this.updateHints();
		this.updateScores();
	};

	waitingForThrowSet() {
		super.waitingForThrowSet();
		ledController.animWipe();
	}

	updateHints() {
		const {
			players,
			currentPlayerIndex,
			dartThrows,
			waitingForThrow,
		} = gameController.gameStatus;

		const currentPlayer = players[currentPlayerIndex];
		const score = this.getScore(currentPlayer, dartThrows);

		const hints: Hint[] = [];
		if (waitingForThrow && score <= 60) {
			if (score === 25)
				hints.push({score: 25, ring: Ring.OuterBullseye });
			if (score === 50)
				hints.push({score: 25, ring: Ring.DoubleBullseye });

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
		}
		//console.log("hints", score, hints)
		if (!_.isEqual(ledController.hints, hints)) {
			ledController.setHints(hints);
			if (hints.length > 0) {
				const scoresLeft: string[] = hints.map(({ score, ring }) => "a " + this.getSpokenScore(score, ring));
				const str = currentPlayer + " just needs " + _.uniq(scoresLeft).join(", or ") + " to win!";
				speak(str);
			}
		}
	}

	getSpokenScore(score: number, ring: Ring) {
		if (ring === Ring.Miss) return "miss";
		if (ring === Ring.Triple) return "triple " + score;
		const scoreStr = score === 25 ? "bullseye" : ""+score;
		if (ring === Ring.Double || ring === Ring.DoubleBullseye) return "double " + scoreStr;
		return scoreStr;
	}
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.DoubleBullseye) return 2;
		return 1;
	}
}

export default Game301;