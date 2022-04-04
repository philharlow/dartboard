import styled from '@emotion/styled/macro';
import React, { useEffect } from 'react';
import './App.css';
import AudioDrawer from './components/AudioDrawer';
import CalibrationScreen from './components/CalibrationScreen';
import DartboardDrawer from './components/DartboardDrawer';
import GameBoard from './components/gameBoards/GameBoard';
import GameSelectionScreen from './components/GameSelectionScreen';
import PlayerSelectionScreen from './components/PlayerSelectionScreen';
import Popup from './components/Popup';
import SettingsDrawer from './components/SettingsDrawer';
import SettingsSelectionScreen from './components/SettingsSelectionScreen';
import ThrowsDrawer from './components/ThrowsDrawer';
import { useConnectionStore } from './store/ConnectionStore';
import { useGameStore } from './store/GameStore';
import { usePlayerStore } from './store/PlayerStore';

const AppDiv = styled.div`
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

function App() {
	const currentGame = useGameStore(store => store.gameList?.find(game => game.gameType === store.currentGameType));
	const players = useGameStore(store => store.players);
	const selectedSettings = useGameStore(store => store.selectedSettings);
	const gameList = useGameStore(store => store.gameList);
	const fetchGameList = useGameStore(store => store.fetchGameList);
	const socketConnected = useConnectionStore(store => store.socketConnected);
	const allPlayers = usePlayerStore(store => store.allPlayers);
	const calibrationMode = useGameStore(store => store.calibrationMode);
	const fetchAllPlayers = usePlayerStore(store => store.fetchAllPlayers);
	
	console.log("app redraw");

	useEffect(() => {
		if (socketConnected && gameList === undefined) {
			fetchGameList();
		}
	}, [fetchGameList, gameList, socketConnected]);

	useEffect(() => {
		if (socketConnected && allPlayers === undefined) {
			fetchAllPlayers();
		}
	}, [fetchAllPlayers, allPlayers, socketConnected]);


	let content: JSX.Element | undefined;

	if (!gameList || !gameList.length) content = <LoadingScreenDiv><div>Loading...</div>	</LoadingScreenDiv>
	else if (calibrationMode) content = <CalibrationScreen />
	else if (!currentGame) content = <GameSelectionScreen />
	else if (!selectedSettings || !selectedSettings.length) content = <SettingsSelectionScreen />
	else if (!players.length) content = <PlayerSelectionScreen />
	else content = <GameBoard />

	return <AppDiv>
		{content}

			<SettingsDrawer />
			<AudioDrawer />
			<ThrowsDrawer />
			<DartboardDrawer />
			<Popup />
	</AppDiv>;
}

export default App;
