import styled from '@emotion/styled/macro';
import React from 'react';
import './App.css';
import AudioDrawer from './components/AudioDrawer';
import DartboardDrawer from './components/DartboardDrawer';
import GameBoard from './components/gameBoards/GameBoard';
import GameSelectionScreen from './components/GameSelectionScreen';
import PlayerSelectionScreen from './components/PlayerSelectionScreen';
import SettingsSelectionScreen from './components/SettingsSelectionScreen';
import SocketDrawer from './components/SocketDrawer';
import ThrowsDrawer from './components/ThrowsDrawer';
import { useGameStore } from './store/GameStore';

const AppDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

function App() {
  const currentGame = useGameStore(store => store.currentGame);
  const players = useGameStore(store => store.players);
  const selectedSettings = useGameStore(store => store.selectedSettings);
  console.log("app redraw");

  let content: JSX.Element | undefined;

  if (!currentGame) content = <GameSelectionScreen />
  else if (currentGame.settingsOptions.length && !selectedSettings) content = <SettingsSelectionScreen />
  else if (!players.length) content = <PlayerSelectionScreen />
  else content = <GameBoard />

  return <AppDiv>
      {content}
    
			<SocketDrawer />
			<AudioDrawer />
			<DartboardDrawer />
			<ThrowsDrawer />
  </AppDiv>;
}

export default App;
