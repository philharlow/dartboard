import express from 'express';
import cors from 'cors';
import http from 'http';
import readline from 'readline';
import gameController from './gameController';
import { parseDartCode } from '../src/types/GameTypes';
import { defaultPlayers } from '../src/types/PlayerTypes';
import ledController from './LedController';
import { gameList } from './gameTypes/GamesList';
import { startSocketServer } from './sockerServer';
import { openSerialConnection } from './serialController';

const app = express();
const server = http.createServer(app);

startSocketServer(server);

openSerialConnection();

gameController.init();



const lineReader = readline.createInterface({
    input: process.stdin,
    //output: process.stdout
})


const port = 80;


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
    const status = { ...gameController.gameStatus };
    res.json(status);
});

app.get('/allPlayers', (req, res) => {
    const players = defaultPlayers;
    res.json(players);
});

  
server.listen(port, () => {
    console.log('listening on *:' + port);
    console.log("Type to send dart commands");

    lineReader.addListener("line", (line) => {
        user = line;
        if (line === "wipe")
            return ledController.animSolidWipe();
        
        const { score, ring } = parseDartCode(line);
        gameController.addDartThrow(score, ring);
    })

});
