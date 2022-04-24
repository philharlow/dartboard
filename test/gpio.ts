import gpio from "rpi-gpio";

console.log("starting")

gpio.promise.setup(7, gpio.DIR_OUT)
    .then(() => {
        return gpio.write(7, true)
    })
    .catch((err) => {
        console.log('Error: ', err.toString())
    })