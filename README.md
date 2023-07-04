# Dartboard project

This is two seperate Typescript projects in one, with additional Arduino code that is necessary to run.
At the core, this is a React application project that runs the fronted UI for the application.
There is also backend NodeJS server applications that runs on port 4000 that interfaces with the serial ports to communicate with the arduinos, and handles all game logic. Via websockets it sends out updates to the game state.

Tested using node 14.20.0


/Arduino
 - Sketches needed for the two Arduinos: Nano and Mega.
/Laser
 - SVGs for my model dartboard replacement front plate


To start:
# Run the react development server on port 3000 and launch your browser to it
npm run start
# Run the react development server on port 3000
npm run start-headless
# Run the server on port 4000
npm run start-server
# Run a build of the React application (this is what is served at :4000/)
npm run build

The :4000 server serves the /build folder. If you make changes to the React app while using port 3000, those changes wont be included on port 4000 until you build the project again. 

On raspbian, to start the server on boot, first edit your crontab:
`sudo chmod +x /home/pi/dartboard/startup.sh`
`crontab -e`
an add this to the bottom and save:
`@reboot /home/pi/dartboard/startup.sh`
