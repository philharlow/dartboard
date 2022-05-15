import styled from '@emotion/styled/macro';
import React, { useEffect } from 'react';
import CalibrationScreen from './components/Screens/CalibrationScreen';
import DartboardDrawer from './components/Drawers/DartboardDrawer';
import GameBoard from './components/gameBoards/GameBoard';
import GameSelectionScreen from './components/Screens/GameSelectionScreen';
import PlayerSelectionScreen from './components/Screens/PlayerSelectionScreen';
import Popup from './components/Overlays/Popup';
import SettingsDrawer from './components/Drawers/SettingsDrawer';
import SettingsSelectionScreen from './components/Screens/SettingsSelectionScreen';
import ThrowsDrawer from './components/Drawers/ThrowsDrawer';
import { useConnectionStore } from './store/ConnectionStore';
import { useGameStore } from './store/GameStore';
import { usePlayerStore } from './store/PlayerStore';
import AudioDrawer from './components/Drawers/AudioDrawer';
import { preloadSounds } from './tools/AudioTools';

const GameViewDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const LoadingScreenDiv = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  place-content: center;
`;

function GameView() {
	const currentGame = useGameStore(store => store.gameList?.find(game => game.gameType === store.currentGameType));
	const players = useGameStore(store => store.players);
	const selectedSettings = useGameStore(store => store.selectedSettings);
	const gameList = useGameStore(store => store.gameList);
	const fetchGameList = useGameStore(store => store.fetchGameList);
	const socketConnected = useConnectionStore(store => store.socketConnected);
	const allPlayers = usePlayerStore(store => store.allPlayers);
	const calibrationState = useGameStore(store => store.calibrationState);
	const fetchAllPlayers = usePlayerStore(store => store.fetchAllPlayers);
	
	// console.log("GameView redraw");

	useEffect(() => {
		if (socketConnected && gameList === undefined) {
			fetchGameList();
			preloadSounds();
		}
	}, [fetchGameList, gameList, socketConnected]);

	useEffect(() => {
		if (socketConnected && allPlayers === undefined) {
			fetchAllPlayers();
		}
	}, [fetchAllPlayers, allPlayers, socketConnected]);


	let content: JSX.Element | undefined;

	// Loading data
	if (!gameList || !gameList.length || !socketConnected)
		content = <LoadingScreenDiv><div>Loading...</div>	</LoadingScreenDiv>
	// Calibration
	else if (calibrationState !== null)
		content = <CalibrationScreen />
	else if (!currentGame)
		content = <GameSelectionScreen />
	else if (!selectedSettings || !selectedSettings.length)
		content = <SettingsSelectionScreen />
	else if (!players.length)
		content = <PlayerSelectionScreen />
	else
		content = <GameBoard />

	return <GameViewDiv>
		{content}

		<SettingsDrawer />
		<ThrowsDrawer />
		<AudioDrawer />
		<DartboardDrawer />
		<Popup />
	</GameViewDiv>;
}

export default GameView;
