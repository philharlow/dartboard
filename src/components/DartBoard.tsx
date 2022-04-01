import { ReactComponent as DartboardSVG } from '../dartboard.svg';
import styled from '@emotion/styled/macro';
import { useEffect, useRef, useState } from 'react';
import { getLedKey, initialLedsObj, LedsObj, Ring } from '../types/LedTypes';
import { useLedStore } from '../store/LedStore';
import { parseDartCode } from '../types/GameTypes';
import { sendDartThrow } from '../SocketInterface';

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

const getSVGElement = (id: string, parent?: HTMLElement): SVGElement | undefined => {
	const element = (parent ?? document).querySelector(id);
	if (element instanceof SVGElement)
		return element;
};


function DartBoard() {
	const ledsObj = useLedStore(store => store.ledsObj);
	const [ lastLeds, setLastLeds ] = useState<LedsObj>(initialLedsObj);
	const ref = useRef() as React.MutableRefObject<HTMLDivElement>;

	const illuminateElement = (on: boolean, score: number, ring: Ring, className = "illuminated") => {
		const elementName = getLedKey(score, ring)
		const element = getSVGElement("#" + elementName, ref.current);
		if (element) {
			if (on) element.classList.add(className);
			else element.classList.remove(className);
		}
	};

	const handleClick = (e: React.MouseEvent) => {
		if (e.target instanceof SVGElement ) {
			const id = e.target.id;
			// console.log("clicked", id)
			const { ring, score } = parseDartCode(id);
			sendDartThrow(score, ring);
		}
	};

	useEffect(() => {
		let changed = false;
		Object.keys(ledsObj).forEach(ledKey => {
			const led = ledsObj[ledKey];
			const lastLed = lastLeds[ledKey];
			if (led.on !== (lastLed?.on ?? false)) {
				illuminateElement(led.on, led.score, led.ring);
				changed = true;
			}
		});
		if (changed)
			setLastLeds(ledsObj);
	}, [lastLeds, ledsObj]);

  return (
    <DartboardDiv ref={ref}>
		<ScaledDartboard onMouseDown={handleClick} />
    </DartboardDiv>
  );
}

export default DartBoard;




