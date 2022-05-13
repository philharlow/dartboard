import express from 'express';
import cors from 'cors';
import http from 'http';
import readline from 'readline';
import gameController from './gameController';
import { parseDartCode } from '../src/types/GameTypes';
import ledController from './ledController';
import { gameList } from './gameTypes/gamesList';
import { startSocketServer } from './socketServer';
import calibrationController from './calibrationController';

// Configuration
const port = 4000;

// Express app
const app = express();
const server = http.createServer(app);

// Game server
startSocketServer(server);
gameController.init();
calibrationController.init();

// Routes
app.use(cors());
app.use('/', express.static('../build'))
app.use('/heckler', express.static('../build'))
app.get('/gameList', (req, res) => res.json(gameList.map((game) => game.gameDef)));
app.get('/gameStatus', (req, res) => res.json({ ...gameController.gameStatus }));
app.get('/allPlayers', (req, res) => res.json(gameController.allPlayers));

// Create port, listen for keyboard input for manual game control
const lineReader = readline.createInterface({ input: process.stdin });
server.listen(port, () => {
    console.log('listening on *:' + port);
    console.log("Type to send dart commands");

    lineReader.addListener("line", (line) => {
        if (line === "wipe")
            return ledController.animSolidWipe();
        
        const { score, ring } = parseDartCode(line);
        gameController.addDartThrow(score, ring);
    })

});
