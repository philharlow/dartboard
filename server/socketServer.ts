import { Server } from 'socket.io';
import { CalibrationMode, GameStatus, GameType, parseDartCode, SelectedSetting } from '../src/types/GameTypes';
import { GameEvent, HeckleEvent, SoundFX, UIEvent } from '../src/types/SocketTypes';
import calibrationController from './calibrationController';
import gameController from './gameController';
import ledController from './ledController';
import http from 'http';


export class SocketServer {
	io: Server;
	connections = [];

	constructor(server: http.Server) {
				
		this.io = new Server(server, {
			cors: {
			origin: '*',
			}
		});


		this.io.on('connection', (socket) => {
			this.connections.push(socket);
			console.log('User connected! Total connections:', this.connections.length);
			ledController.sendLedsToSocket();

			socket.on("disconnect", (reason) => {
				this.connections.splice(this.connections.indexOf(socket), 1);
				console.log('User disconnected! Total connections:', this.connections.length);

			});
			socket.on(GameEvent.ADD_DART_THROW, (dart) => {
				//console.log('socket get dart:', dart);
				const { score, ring } = parseDartCode(dart);
				gameController.addDartThrow(score, ring);
			});
			socket.on(GameEvent.START_GAME, (currentGame?: GameType) => {
				gameController.setGameType(currentGame);
			});
			socket.on(GameEvent.SET_SETTINGS, (settings?: SelectedSetting[]) => {
				gameController.setSettings(settings);
			});
			socket.on(GameEvent.SET_PLAYERS, (players?: string[]) => {
				gameController.setPlayers(players);
			});
			socket.on(GameEvent.NEXT_PLAYER, () => {
				gameController.nextPlayer();
			});
			socket.on(GameEvent.UNDO_LAST_DART, () => {
				gameController.undoLastDart();
			});
			socket.on(GameEvent.CLEAR_CALIBRATION, (mode: CalibrationMode) => {
				calibrationController.clearCalibration(mode);
			});
			socket.on(GameEvent.SET_CALIBRATION_STEP, () => {
				calibrationController.startCalibration();
			});
			socket.on(HeckleEvent.HECKLE, (text) => { // Forward from heckle ui to main tablet
				speak(text);
			});
			socket.on(HeckleEvent.PLAY_SOUND, (sound) => { // Forward from heckle ui to main tablet
				playSound(sound);
			});
			socket.on(HeckleEvent.DISTRACTION, (distraction) => { // Forward from heckle ui to main tablet
				ledController.handleDistraction(distraction);
			});
			socket.on(GameEvent.SET_WAITING_FOR_THROW, (waitingForThrow: boolean) => {
				gameController.updateGameStatus({ waitingForThrow });
				gameController.currentGame?.waitingForThrowSet();
			});
			socket.on(GameEvent.UPDATE_GAME_STATUS, (changes: Partial<GameStatus>) => {
				console.log(GameEvent.UPDATE_GAME_STATUS, changes);
				this.io.emit(GameEvent.UPDATE_GAME_STATUS, changes);
				Object.assign(gameController.gameStatus, changes);
			});
		});
	}

	emit = (topic: string, data: any) => {
		this.io.emit(topic, data);
	};

}

export let socketServer: SocketServer | undefined;

export const startSocketServer = (server: http.Server) => {
	socketServer = new SocketServer(server);
}

export const emit = (topic: string, data: any) => {
	socketServer?.emit(topic, data);
};

export const speak = (message: string, immediate?: boolean) => {
	socketServer?.emit(UIEvent.SPEAK, { message, immediate });
};

export const playSound = (sound: SoundFX) => {
	socketServer?.emit(UIEvent.PLAY_SOUND, sound);
};

export const showPopup = (message: string, sound?: string) => {
	socketServer?.emit(UIEvent.SHOW_POPUP, { message, sound });
};