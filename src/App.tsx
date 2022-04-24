import styled from '@emotion/styled/macro';
import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import GameView from './GameView';
import HecklerView from './HecklerView';

const AppDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;


function App() {
	return <AppDiv>
		<Router>
			<Routes>
				<Route path='/heckler' element={<HecklerView/>} />
          		<Route path="*" element={<GameView/>}/>
			</Routes>
		</Router>
        
	</AppDiv>;
}

export default App;
