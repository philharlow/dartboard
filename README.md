# Dartboard project

This is two seperate Typescript projects in one, with additional Arduino code that is necessary to run.
At the core, this is a React application project that runs the fronted UI for the application.
There is also backend NodeJS server applications that runs on port 4000 that interfaces with the serial ports to communicate with the arduinos, and handles all game logic. Via websockets it sends out updates to the game state.

Tested using node 14.20.0

Incomplete writeup/diy guide here:
https://philsprojects.wordpress.com/2022/05/06/dartboard-build-instructions/

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

If you make changes to the React app whil using port 3000, those changes wont be included on port 4000 until you build the project again. The :4000 server serves the /build folder.

To start the server on boot:
`sudo chmod +x /home/pi/dartboard/startup.sh`
`crontab -e`
add to the bottom:
`@reboot /home/pi/dartboard/startup.sh`

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
