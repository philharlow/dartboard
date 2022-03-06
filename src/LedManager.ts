import { cloneDeep } from "lodash";
import { useLedStore } from "./store/LedStore";
import { Hint, Led, Ring } from "./types/LedTypes";

const wipeOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const growOrder = [Ring.InnerBullseye, Ring.OuterBullseye, Ring.InnerSingle, Ring.Triple, Ring.OuterSingle, Ring.Double];

export const countOns = (arr: Led[]) => arr.reduce((a, v) => (v.on ? a + 1 : a), 0);

const initialLeds: Led[] = [];
const on = false;
for (let i=1; i<=20; i++) {
	initialLeds.push({ring: Ring.InnerSingle, score: i, on});
	initialLeds.push({ring: Ring.OuterSingle, score: i, on});
	initialLeds.push({ring: Ring.Double, score: i, on});
	initialLeds.push({ring: Ring.Triple, score: i, on});
}
initialLeds.push({ring: Ring.InnerBullseye, score: 25, on});
initialLeds.push({ring: Ring.OuterBullseye, score: 25, on});

interface PendingFlash {
	timeout: NodeJS.Timeout;
	score: number;
	ring: Ring;
}

class LedManager {
	leds: Led[] = initialLeds;
	pendingFlashes: PendingFlash[] = [];
	hints: Hint[] = [];

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
	
	doWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<21; i++) {
			setTimeout(() => this.setScoreOn(wipeOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(wipeOrder[i%20], false), scoreTime * (i + 1));
		}
	};
	
	doSolidWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<=20; i++) {
			setTimeout(() => this.setScoreOn(wipeOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(wipeOrder[i%20], false), 20 * scoreTime + scoreTime * i);
		}
	};
	
	doSolidGrow = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), growOrder.length * ringTime + ringTime * i);
		});
	};
	
	doGrow = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
	};
	
	doShrink = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		[...growOrder].reverse().forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
	};
	
	flashLed = (score: number, ring: Ring, duration = 100, flashes = 3, dispatch: boolean = true) => {
		this.setSingleLedOn(score, ring, true, dispatch);
		this.setSingleLedOnLater(score, ring, false, duration);
		for (let i=1; i<flashes; i++) {
			this.setSingleLedOnLater(score, ring, true, i * 2 * duration);
			this.setSingleLedOnLater(score, ring, false, (i * 2 + 1) * duration);
		}
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
		const clone = cloneDeep(this.leds);
		useLedStore.getState().setLeds(clone);
	}
	
}


const ledManager = new LedManager();

export default ledManager;