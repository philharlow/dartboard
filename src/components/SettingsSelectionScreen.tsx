import styled from '@emotion/styled/macro';
import { Button, MenuItem, Select } from '@mui/material';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { useGameStore } from '../store/GameStore';
import { SelectedSetting } from '../types/GameTypes';
import BackButton from './BackButton';

const RootDiv = styled.div`
    height: 100%;
	width: 75%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 20px;
`;
const GameTitle = styled.div`
	font-size: 26px;
	text-align: center;
	left: 50%;
	top: 40px;
	transform: translate(-50%);
	position: absolute;
`;
const NextButton = styled(Button)`
	position: absolute;
	right: 30px;
	bottom: 50px;
	font-size: 26px;
	padding: 15px 25px;
	background: #6a6a;
	border-radius: 10px;
`;
const SettingRow = styled.div`
	font-size: 26px;
    display: flex;
    flex-direction: row;
	gap: 20px;
    border: 1px solid white;
    padding: 10px;
`;
const ColoredSelect = styled(Select)`
	min-width: 200px;
	color: #fff;
	fieldset {
		border-color: #fff;
		&:active {
			border-color: #fff;
		}
	}
	svg {
      fill: #fff;
    }
`;
const Grow = styled.div`
	flex-grow: 1;
    padding: 10px;
`;

function SettingsSelectionScreen() {
	const currentGame = useGameStore(store => store.gameList?.find(game => game.gameType === store.currentGameType));
	const selectGame = useGameStore(store => store.selectGame);
	const setSelectedSettings = useGameStore(store => store.setSelectedSettings);

	const [ selections, setSelections ] = useState<SelectedSetting[]>(currentGame?.settingsOptions?.map(o => ({ name: o.name, option: o.options[0] })) || []);

	const setSelection = (name: string, option: string) => {
		const newSelections = cloneDeep(selections);
		const selection = newSelections.find(s => s.name === name);
		if (selection) selection.option = option;
		setSelections(newSelections)
	}

	return (
		<RootDiv>
			<GameTitle>
				{currentGame?.name} Settings
			</GameTitle>
			{selections.map(selection => <SettingRow key={selection.name}>
					<Grow>
						{selection.name}
					</Grow>
					<ColoredSelect
						value={selection.option}
						onChange={(ev) => setSelection(selection.name, (ev.target as any).value)}
					>
						{currentGame?.settingsOptions?.find(o => o.name === selection.name)?.options.map(option => 
							<MenuItem key={option} value={option}>{option}</MenuItem>
						)}
					</ColoredSelect>
				</SettingRow>
				)}
			<BackButton onClick={() => selectGame(undefined)} />
			<NextButton
				variant="contained"
				onClick={() => setSelectedSettings(selections)}
			>
				Next
			</NextButton>
		</RootDiv>
	);
}

export default SettingsSelectionScreen;




