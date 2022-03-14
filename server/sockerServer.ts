import { Server } from 'socket.io';
import { GameStatus, GameType, parseDartCode, SelectedSetting } from '../src/types/GameTypes';
import { SocketEvent } from '../src/types/SocketTypes';
import gameController from './gameController';
import { gameList } from './gameTypes/GamesList';


export class SocketServer {
	io: Server;
	connections = [];

	constructor(server) {
				
		this.io = new Server(server, {
			cors: {
			origin: '*',
			}
		});


		this.io.on('connection', (socket) => {
			this.connections.push(socket);
			console.log('a user connected', this.connections.length);

			socket.on("disconnect", (reason) => {
				this.connections.splice(this.connections.indexOf(socket), 1);
				console.log('socket disconnected', this.connections.length);

			});
			socket.on(SocketEvent.ADD_DART_THROW, (dart) => {
				console.log('socket get dart:', dart);
				const { score, ring } = parseDartCode(dart);
				gameController.addDartThrow(score, ring);
			});
			socket.on(SocketEvent.START_GAME, (currentGame?: GameType) => {
				gameController.startGame(currentGame);
			});
			socket.on(SocketEvent.SET_SETTINGS, (settings?: SelectedSetting[]) => {
				gameController.setSettings(settings);
			});
			socket.on(SocketEvent.SET_PLAYERS, (players?: string[]) => {
				gameController.setPlayers(players);
			});
			socket.on(SocketEvent.NEXT_PLAYER, () => {
				gameController.nextPlayer();
			});
			socket.on(SocketEvent.UNDO_LAST_DART, () => {
				gameController.undoLastDart();
			});
			socket.on(SocketEvent.UPDATE_GAME_STATUS, (changes: Partial<GameStatus>) => {
				console.log(SocketEvent.UPDATE_GAME_STATUS, changes);
				this.io.emit(SocketEvent.UPDATE_GAME_STATUS, changes);
				Object.assign(gameController.gameStatus, changes);
			});
		});
	}

	emit = (topic: string, data: any) => {
		this.io.emit(topic, data);
	};

}

export let socketServer: SocketServer | undefined;

export const startSocketServer = (server) => {
	socketServer = new SocketServer(server);
}

export const emit = (topic: string, data: any) => {
	socketServer?.emit(topic, data);
};

export const speak = (message: string, immediate?: boolean) => {
	socketServer?.emit(SocketEvent.SPEAK, { message, immediate });
};