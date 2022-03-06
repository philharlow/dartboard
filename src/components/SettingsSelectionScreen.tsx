import styled from '@emotion/styled';
import { Button, MenuItem, Select } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { SelectedSetting } from '../gameTypes/GameType';
import { useGameStore } from '../store/GameStore';
import BackButton from './BackButton';

const RootDiv = styled.div`
    height: 100%;
	width: 100%;
`;
const GameTitle = styled.div`
	font-size: 26px;
	text-align: center;
	left: 50%;
	top: 40px;
	transform: translate(-50%);
	position: absolute;
`;
const StartButton = styled(Button)`
	position: absolute;
	left: 80%;
	bottom: 50px;
	font-size: 26px;
	transform: translate(-50%);
	background: #6a6a;
	border-radius: 10px;
`;
const SettingRow = styled.div`
	font-size: 26px;
`;


function SettingsSelectionScreen() {
	const currentGame = useGameStore(store => store.currentGame);
	const startGame = useGameStore(store => store.startGame);
	const setSelectedSettings = useGameStore(store => store.setSelectedSettings);

	const [ selections, setSelections ] = useState<SelectedSetting[]>(currentGame!.settingsOptions.map(o => ({ name: o.name, option: o.options[0] })));

	const setSelection = (name: string, option: string) => {
		const newSelections = cloneDeep(selections);
		const selection = newSelections.find(s => s.name === name);
		if (selection) selection.option = option;
		setSelections(newSelections)
	}

	return (
		<RootDiv>
			<GameTitle>
				{currentGame?.gameDef.name}
			</GameTitle>
			Settings
			{selections.map(selection => <SettingRow key={selection.name}>
					{selection.name}
					<Select
						value={selection.option}
						onChange={(ev) => setSelection(selection.name, ev.target.value || "uhoh")}
					>
						{currentGame!.settingsOptions.find(o => o.name === selection.name)?.options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
					</Select>
				</SettingRow>
				)}
			<BackButton onClick={() => startGame(undefined)} />
			<StartButton
				variant="contained"
				onClick={() => setSelectedSettings(selections)}
			>
				Next
			</StartButton>
		</RootDiv>
	);
}

export default SettingsSelectionScreen;




