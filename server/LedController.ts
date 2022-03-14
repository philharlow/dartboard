import { cloneDeep } from "lodash";
import { Hint, Led, Ring, initialLeds, getLedsAsInts, scoreOrder, growOrder } from "../src/types/LedTypes";
import { emit } from "./sockerServer";

interface PendingFlash {
	timeout: NodeJS.Timeout;
	score: number;
	ring: Ring;
}


export const countOns = (arr: Led[]) => arr.reduce((a, v) => (v.on ? a + 1 : a), 0);

class LedController {
	leds: Led[] = cloneDeep(initialLeds);
	pendingFlashes: PendingFlash[] = [];
	hints: Hint[] = [];
	needsDispatch = false;

	loop = () => {
		if (this.needsDispatch) {
			this.sendToSocket();
			this.needsDispatch = false;
		}
	}
	loopInterval = setInterval(this.loop, 1000 / 50);

	setAllOn(on: boolean, dispatch: boolean = true): boolean {
		let changed = false;
		for (let i=0; i<=20; i++)
			changed = this.setScoreOn(i, on, false) || changed;
		
		if (changed && dispatch)
			this.dispatchUpdate();
		return changed;
	}
	
	cancelPendingFlashes = () => {
		this.pendingFlashes.forEach(flash => {
			if (flash.score < 25)
				clearTimeout(flash.timeout)
		});
		this.pendingFlashes = [];
		this.hints = [];
	};
	
	flashLed = (score: number, ring: Ring, duration = 100, flashes = 3, dispatch: boolean = true) => {
		this.setSingleLedOn(score, ring, true, dispatch);
		this.setSingleLedOnLater(score, ring, false, duration);
		for (let i=1; i<flashes; i++) {
			this.setSingleLedOnLater(score, ring, true, i * 2 * duration);
			this.setSingleLedOnLater(score, ring, false, (i * 2 + 1) * duration);
		}
		this.setSingleLedOnLater(score, ring, this.hints.find(h => h.score === score && h.ring === ring) !== undefined, (flashes * 2 + 2) * duration);
	};

	setHints = (hints: Hint[], dispatch: boolean = true) => {
		let changed = false;
		for (const hint of this.hints) {
			changed = this.setSingleLedOn(hint.score, hint.ring, false, false) || changed;
		}
		for (const hint of hints) {
			changed = this.setSingleLedOn(hint.score, hint.ring, true, false) || changed;
		}
		this.hints = hints;
		
		if (changed && dispatch)
			this.dispatchUpdate();
	};


	setRingOn(ring: Ring, on: boolean, dispatch: boolean = true): boolean {
		let changed = false;
		if (ring === Ring.InnerBullseye || ring === Ring.OuterBullseye) {
			changed = this._setLedOn(25, ring, on) || changed;
		} else {
			for (let i=0; i<=20; i++)
				changed = this._setLedOn(i, ring, on) || changed;
		}
		if (changed && dispatch)
			this.dispatchUpdate();
		return changed;
	}

	setScoreOn(score: number, on: boolean, dispatch: boolean = true): boolean {
		let changed = this._setLedOn(score, Ring.InnerSingle, on);
		changed = this._setLedOn(score, Ring.Triple, on) || changed;
		changed = this._setLedOn(score, Ring.OuterSingle, on) || changed;
		changed = this._setLedOn(score, Ring.Double, on) || changed;
		
		if (changed && dispatch)
			this.dispatchUpdate();
		return changed;
	}

	setSingleLedOn(score: number, ring: Ring, on: boolean, dispatch: boolean = true): boolean {
		const changed = this._setLedOn(score, ring, on);
		if (changed && dispatch)
			this.dispatchUpdate();
		return changed;
	}
	
	setSingleLedOnLater = (score: number, ring: Ring, on: boolean, delay = 50) => {
		const timeout = setTimeout(() => {
			this.pendingFlashes = this.pendingFlashes.filter(t => t.timeout !== timeout);
			this.setSingleLedOn(score, ring, on);
		}, delay);
		this.pendingFlashes.push({ timeout, score, ring });
	};

	private _setLedOn = (score: number, ring: Ring, on: boolean): boolean => {
		let changed = false;
		const led = this.leds.find(led => led.score === score && led.ring === ring);
		if (led && led.on !== on) {
			led.on = on;
			changed = true;
		}
		return changed;
	};

	dispatchUpdate = () => {
		this.needsDispatch = true;
	}

	sendToSocket() {
		const leds = cloneDeep(this.leds);
		const ints = getLedsAsInts(leds);

		emit("leds", ints);
	}

	// Animations
	
	animQuadSpin = () => {
		this.cancelPendingFlashes();
		const flashTime = 50;
		const loops = 4;
		const blades = 4;
		const spacing = 20 / blades;
		for (let i=0; i<=loops * spacing; i++) {
			for (let blade=0; blade<blades; blade++) {
				setTimeout(() => this.setScoreOn(scoreOrder[(i + blade * spacing)%20], true), flashTime * i);
				setTimeout(() => this.setScoreOn(scoreOrder[(i + blade * spacing)%20], false), flashTime * (i + 1));
			}
		}
	};
	
	animWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<=20; i++) {
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], false), scoreTime * (i + 1));
		}
	};
	
	animSolidWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<=20; i++) {
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], false), 20 * scoreTime + scoreTime * i);
		}
	};
	
	animSolidGrow = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), growOrder.length * ringTime + ringTime * i);
		});
	};
	
	animGrow = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
	};
	
	animShrink = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		[...growOrder].reverse().forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
	};
	
	
}


const ledController = new LedController();

export default ledController;