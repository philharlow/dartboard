import express from 'express';
import cors from 'cors';
import http from 'http';
import readline from 'readline';
import gameController from './gameController';
import { parseDartCode } from '../src/types/GameTypes';
import ledController from './LedController';
import { gameList } from './gameTypes/GamesList';
import { startSocketServer } from './sockerServer';

const app = express();
const server = http.createServer(app);

startSocketServer(server);

const lineReader = readline.createInterface({
    input: process.stdin,
    //output: process.stdout
})


const port = 4000;


let user = "world";

app.use(cors());

app.use('/', express.static('../build'))

app.get('/', (req, res) => {
    res.send('Hello ' + user);
    //res.sendFile(__dirname + '/index.html');
});

app.get('/gameList', (req, res) => {
    res.json(gameList.map((game) => game.gameDef));
});

app.get('/gameStatus', (req, res) => {
    const currentGameIndex = gameList.findIndex(game => game.gameDef.gameType === gameController.currentGame?.gameDef.gameType);
    const status = { ...gameController.gameStatus, currentGameType: currentGameIndex };
    res.json(status);
});

  
server.listen(port, () => {
    console.log('listening on *:3001');
    console.log("Type to send dart commands");

    lineReader.addListener("line", (line) => {
        user = line;
        if (line === "wipe")
            return ledController.animSolidWipe();
        
        const { score, ring } = parseDartCode(line);
        gameController.addDartThrow(score, ring);
    })

});
