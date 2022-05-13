import { cloneDeep } from "lodash";
import { GameBoardButtons } from "../src/types/GameTypes";
import { Hint, Led, Ring, getLedsAsInts, scoreOrder, growOrder, initialLedsObj, getLedKey, LedsObj, Coordinate, turnOnCircle, diameter, ledXYCoords, turnOnLine, LedAnimation, AnimationType, AnimationFrame, LedButton } from "../src/types/LedTypes";
import { LightDistraction, SocketEvent, SoundFX } from "../src/types/SocketTypes";
import { getButtonLedsValue, setButtonLedOn, updateFromLedObj, writeButtonLedsToSerial } from "./serialLedController";
import { emit } from "./socketServer";

interface PendingFlash {
	timeout: NodeJS.Timeout;
	score: number;
	ring: Ring;
}

export const getRandomSegment = (): Hint => {
	const score = 1 + Math.floor(Math.random() * 20); // 1-21 (21 for bullseye)
	// Bullseye
	if (score > 20) {
		const ring = Math.random() > 0.5 ? Ring.DoubleBullseye : Ring.OuterBullseye;
		return { ring, score: 25 };
	}
	const ring: Ring = Math.floor(Math.random() * 4); // First 4 are Double, OuterSingle, Triple, InnerSingle currently
	return { ring, score };
}

export const countOns = (arr: Led[]) => arr.reduce((a, v) => (v.on ? a + 1 : a), 0);

enum AnimationMode {
	Stopped,
	PlayOnce,
	PlayOnceReverse,
	Loop,
	LoopReverse,
	//Boomerang,
}

class LedController {
	// leds: Led[] = cloneDeep(initialLeds);
	ledsObj: LedsObj = cloneDeep(initialLedsObj);
	pendingFlashes: PendingFlash[] = [];
	hints: Hint[] = [];
	needsDispatch = false;
	currentAnimation?: LedAnimation;
	animationFrame = 0;
	animationStartedAt = 0;
	animationMode = AnimationMode.Stopped;

	handleDistraction = (distraction: LightDistraction) => {
		if (distraction === LightDistraction.ADD_RANDOM_HINT) {
			const newHints: Hint[] = [ ...this.hints, getRandomSegment() ];
			this.setHints(newHints);
		}
		if (distraction === LightDistraction.REMOVE_HINTS) {
			this.setHints([]);
		}
		if (distraction === LightDistraction.WIPE_ANIMATION) {
			this.animWipe();
		}
		if (distraction === LightDistraction.GROW_ANIMATION) {
			this.animGrow();
		}
	}

	stopAnimation = () => {
		if (this.currentAnimation) {
			if (this.currentAnimation.clearAfter)
				updateFromLedObj(initialLedsObj);
			
			this.animationMode = AnimationMode.Stopped;
			this.currentAnimation = undefined;
		}
	};

	playAnimation = (animation?: LedAnimation, animationMode?: AnimationMode) => {
		this.currentAnimation = animation;
		if (animation) {
			this.animationStartedAt = Date.now();
			this.animationMode = animationMode ?? AnimationMode.PlayOnce;
			this.animationFrame = this.animationMode === AnimationMode.PlayOnceReverse || this.animationMode === AnimationMode.LoopReverse ? animation.frames.length - 1 : 0;
			const frame = this.currentAnimation.frames[this.animationFrame];
			updateFromLedObj(frame.leds);
		}
	};

	loop = () => {
		if (this.currentAnimation) {
			const now = Date.now();
			const elapsed = now - this.animationStartedAt;
			const direction = this.animationMode === AnimationMode.PlayOnceReverse || this.animationMode === AnimationMode.LoopReverse ? -1 : 1;
			const nextFrameIndex = this.animationFrame + direction;
			const nextFrame = this.currentAnimation.frames[nextFrameIndex];
			if (!nextFrame) {
				// anim done
				if (this.animationMode === AnimationMode.PlayOnce || this.animationMode === AnimationMode.PlayOnceReverse) {
					if (this.currentAnimation.clearAfter)
						this.stopAnimation();
				} else { // Loop
					this.playAnimation(this.currentAnimation, this.animationMode);
				}
			} else {
				const lastFrame = this.currentAnimation.frames[this.currentAnimation.frames.length - 1];
				const duration = lastFrame.time;
				const nextFrameTime = direction === 1 ? nextFrame.time : duration - nextFrame.time;

				if (nextFrameTime <= elapsed) {
					this.animationFrame = nextFrameIndex;
					const frame = this.currentAnimation.frames[this.animationFrame];
					updateFromLedObj(frame.leds);
					console.log("anim updating leds");
				}
			}
		}
		if (this.needsDispatch) {
			this.sendLedsToSocket();
			// this.sendToSerial(); // send immediately instead
			this.needsDispatch = false;
		}
	}
	loopInterval = setInterval(this.loop, 20); // 50 hertz

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
		const timeout = setTimeout(() => {
			this.setSingleLedOn(score, ring, this.getHintOn(score, ring));
		}, (flashes * 2) * duration);
		this.pendingFlashes.push({ timeout, score, ring });

		// TODO: do this in a better place
		if (score === 25)
			this.animBullseye();
	};

	getHintOn(score: number, ring: Ring): boolean {
		return this.hints.find(h => h.score === score && h.ring === ring) !== undefined;
	}

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

	drawHints = (dispatch: boolean = true) => {
		let changed = false;
		for (const hint of this.hints) {
			changed = this.setSingleLedOn(hint.score, hint.ring, true, false) || changed;
		}
		
		if (changed && dispatch)
			this.dispatchUpdate();
	};


	setRingOn(ring: Ring, on: boolean, dispatch: boolean = true): boolean {
		let changed = false;
		if (ring === Ring.DoubleBullseye || ring === Ring.OuterBullseye) {
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
		const led = this.ledsObj[getLedKey(score, ring)];// leds.find(led => led.score === score && led.ring === ring);
		if (led && led.on !== on) {
			led.on = on;
			changed = true;
		}
		return changed;
	};

	dispatchUpdate = () => {
		this.needsDispatch = true;
		this.sendLedsToSerial();
	}

	sendLedsToSerial() {
		const ledsObj = cloneDeep(this.ledsObj);
		//const ints = getLedsAsSerialInts(ledsObj);

		updateFromLedObj(ledsObj);
	}

	sendLedsToSocket() {
		const ledsObj = cloneDeep(this.ledsObj);
		const ints = getLedsAsInts(ledsObj);

		//console.log("leds", ledsObj)

		emit(SocketEvent.UPDATE_LEDS, ints);
	}

	updateButtons(buttons: GameBoardButtons) {
		const startValue = getButtonLedsValue();
		setButtonLedOn(LedButton.UNDO, buttons.undo);
		setButtonLedOn(LedButton.MISS, buttons.miss);
		setButtonLedOn(LedButton.NEXT, buttons.nextPlayer);
		const updatedValue = getButtonLedsValue();

		// console.log("ledcontroller: update buttons", buttons);

		if (startValue !== updatedValue) {
			this.sendButtonsToSerial();
			this.sendButtonsToSocket();
		}
	}

	sendButtonsToSerial() {
		writeButtonLedsToSerial();
	}

	sendButtonsToSocket() {
		const value = getButtonLedsValue();
		emit(SocketEvent.UPDATE_BUTTON_LEDS, value);
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
		setTimeout(() => this.drawHints(), flashTime * (loops * spacing + 2));
	};
	
	animWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<=20; i++) {
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], false), scoreTime * (i + 1));
		}
		setTimeout(() => this.drawHints(), scoreTime * 21);
	};
	
	animSolidWipe = () => {
		this.cancelPendingFlashes();
		const scoreTime = 50;
		for (let i=0; i<=20; i++) {
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], true), scoreTime * i);
			setTimeout(() => this.setScoreOn(scoreOrder[i%20], false), 20 * scoreTime + scoreTime * i);
		}
		setTimeout(() => this.drawHints(), scoreTime * 2 * 21);
	};
	
	animSolidGrow = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), growOrder.length * ringTime + ringTime * i);
		});
		setTimeout(() => this.drawHints(), ringTime * 2 * growOrder.length);
	};
	
	animGrow = (ringTime = 150) => {
		console.log("anim grow");
		this.cancelPendingFlashes();
		growOrder.forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
		setTimeout(() => this.drawHints(), ringTime * growOrder.length + 1);
	};
	
	animShrink = () => {
		this.cancelPendingFlashes();
		const ringTime = 150;
		[...growOrder].reverse().forEach((ring, i) =>  {
			setTimeout(() => this.setRingOn(ring, true), ringTime * i);
			setTimeout(() => this.setRingOn(ring, false), ringTime * (i + 1));
		});
		setTimeout(() => this.drawHints(), ringTime * growOrder.length + 1);
	};

	// TODO clean this up, make it dependent on a real score
	animBullseye = () => {
		this.animGrow(50);
		
		emit(SocketEvent.PLAY_SOUND, SoundFX.BULLS_EYE);
	};
	

	animRipple = (score: number, ring: Ring, thickness = 3, speed = 2) => {
		const center: Coordinate = ledXYCoords[getLedKey(score, ring)];
		const max = 20;
		const timeStep = 50 / speed;
		const frames: AnimationFrame[] = [];
		for (let i=0; i<max; i++) {
			const inner = (i / max) * diameter;
			const leds = turnOnCircle(center, inner, inner + thickness);
			const time = i * timeStep;
			const frame: AnimationFrame = { leds, time };
			frames.push(frame);
		}
		const animation: LedAnimation = {
			frames,
			name: "ripple",
			clearAfter: true,
			type: AnimationType.ALTERNATING_SCORES,
		}
		this.playAnimation(animation, AnimationMode.Loop);
	}
	

	animVerticalSwipe = (thickness = 10, speed = 2) => {
		const max = 10;
		const timeStep = 100 / speed;
		const radius = diameter / 2;
		for (let i=0; i<max; i++) {
			setTimeout(() => {
				const x = ((i / max) * diameter) - radius;
				const leds = turnOnLine(x, undefined, thickness);
				updateFromLedObj(leds);
			}, i * timeStep);
		}
		setTimeout(() => updateFromLedObj(initialLedsObj), (max + 1) * timeStep);
	}
	
	
}


const ledController = new LedController();

export default ledController;