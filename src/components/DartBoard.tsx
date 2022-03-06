import { ReactComponent as DartboardSVG } from '../dartboard.svg';
import styled from '@emotion/styled';
import { useGameStore } from '../store/GameStore';
import { useEffect, useState } from 'react';
import { Led, Ring } from '../types/LedTypes';
import ledManager from '../LedManager';
import { useLedStore } from '../store/LedStore';

const DartboardDiv = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 400px;
	min-height: 400px;
`;
const ScaledDartboard = styled(DartboardSVG)`
	//max-height: 100%;
`;
const getElementPrefix = (score: number, ring: Ring) => {
	if (ring === Ring.Triple) return "t" + score;
	if (ring === Ring.Double || ring === Ring.InnerBullseye) return "d" + score;
	if (ring === Ring.OuterSingle) return "o" + score;
	return "s" + score;
};

const getSVGElement = (id: string): SVGElement | undefined => {
	const element = document.querySelector(id);
	if (element instanceof SVGElement)
		return element;
};


function DartBoard() {
	const players = useGameStore(store => store.players);
	const currentPlayerIndex = useGameStore(store => store.currentPlayerIndex);
	const currentGame = useGameStore(store => store.currentGame);
	const leds = useLedStore(store => store.leds);
	const [ lastLeds, setLastLeds ] = useState<Led[]>(leds);

	const illuminateElement = (on: boolean, score: number, ring: Ring, className = "illuminated") => {
		const elementName = getElementPrefix(score, ring)
		const element = getSVGElement("#" + elementName);
		if (element) {
			if (on) element.classList.add(className);
			else element.classList.remove(className);
		}
	};

	const getRing = (char: string) => {
		if (char === "m") return Ring.Miss;
		if (char === "t") return Ring.Triple;
		if (char === "d") return Ring.Double;
		if (char === "o") return Ring.OuterSingle;
		return Ring.InnerSingle;
	}

	const parseDartCode = (code: string) => {
		const ring = getRing(code[0]);
		if (ring === Ring.Miss)
			return { score: 0, ring }
		const score = parseInt(code.substring(1));
		if (score === 25)
			return { ring: ring === Ring.InnerSingle ? Ring.OuterBullseye : Ring.InnerBullseye, score: 25 };
		return { ring, score };
	}

	const handleClick = (e: React.MouseEvent) => {
		if (e.target instanceof SVGElement ) {
			const id = e.target.id;
			// console.log("clicked", id)
			const { ring, score } = parseDartCode(id);
				
			if (currentGame) {
				const player = players[currentPlayerIndex]?.name || "Unknown";
				currentGame?.addDartThrow(player, score, ring);
			} else {
				ledManager.flashLed(score, ring);
			}
		}
	};

	useEffect(() => {
		let changed = false;
		for (const led of leds) {
			const lastLed = lastLeds.find(l => l.ring === led.ring && l.score === led.score);
			if (led.on !== (lastLed?.on ?? false)) {
				illuminateElement(led.on, led.score, led.ring);
				changed = true;
			}
		}
		if (changed)
			setLastLeds(leds);
	}, [lastLeds, leds]);

  return (
    <DartboardDiv>
		<ScaledDartboard onMouseDown={handleClick} />
    </DartboardDiv>
  );
}

export default DartBoard;




