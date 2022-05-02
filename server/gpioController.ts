import gpio, { promise } from "rpi-gpio";
import gameController from "./gameController";
import { Ring } from '../src/types/LedTypes';

console.log("Starting GPIO");

const ledPin = 7; //  GPIO4
const tiltSensor = 11; //  GPIO17

const outputs = [ledPin];

const tiltSensorCooldownTime = 1000; // ms
let tiltSensorCooldown;
let missDelay;
const tiltSensorEvent = () => {
	if (tiltSensorCooldown) return;
	console.log("miss!");
	missDelay = setTimeout(() => gameController.addDartThrow(0, Ring.Miss), 500);
	turnGpioOn(ledPin, true);
	tiltSensorCooldown = setTimeout(() => {
		turnGpioOn(ledPin, false);
		tiltSensorCooldown = undefined;
	}, tiltSensorCooldownTime);
};


gpio.on('change', function(channel, value) {
	if (channel === tiltSensor) {
		tiltSensorEvent();
	}
});

export const initGPIO = () => {
	//for (const input of inputs) promise.setup(input, gpio.DIR_IN);
	for (const output of outputs) promise.setup(output, gpio.DIR_OUT);
	gpio.setup(tiltSensor, gpio.DIR_IN, gpio.EDGE_RISING);
}

export const turnGpioOn = (pin: number, val: boolean) => {
	gpio.write(pin, val);
}