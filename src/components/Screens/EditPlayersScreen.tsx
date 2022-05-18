import styled from '@emotion/styled/macro';
import { Button } from '@mui/material';
import { useState } from 'react';
import { usePlayerStore } from '../../store/PlayerStore';
import BackButton from '../BackButton';
import PlayerDetailsScreen from './PlayerDetailsScreen';

const RootDiv = styled.div`
    height: 100%;
	width: 100%;
`;

const Slider = styled.div`
	display: flex;
	flex-direction: row;
	
    height: 100%;
    align-items: center;
    text-align: center;
    overflow-x: auto;
	gap: 15px;
	padding: 0 50px;
`;
const PlayerButton = styled.div`
	width: 200px;
	height: 200px;
	background: #0d0d0d61;
	flex-shrink: 0;
    display: flex;
	flex-direction: column;
    align-items: center;
    justify-content: center;
	font-size: 40px;
	//max-height: 100%;
	&.selected {
		background: #6a6a;
	}
`;
const GameTitle = styled.div`
	font-size: 46px;
	text-align: center;
	left: 50%;
	top: 40px;
	transform: translate(-50%);
	position: absolute;
`;
const GamePlayers = styled.div`
	font-size: 26px;
`;
const AddButton = styled(Button)`
	font-size: 26px;
	padding: 30px 20px;
	font-size: 30px;
	background: #6a6a;
	border-radius: 10px;
`;
const EditButton = styled(AddButton)`
	background: #2149c1;
`;
const DeleteButton = styled(AddButton)`
	background: #c14121;
`;

const ButtonRow = styled.div`
	display: flex;
	position: fixed;
	width: 100vw;
	bottom: 10px;
	gap: 10px;
	margin: 20px;
`;
const Space = styled.div`
	flex: 1;
`;

function EditPlayersScreen() {
	const allPlayers = usePlayerStore(store => store.allPlayers);
	const edittingPlayer = usePlayerStore(store => store.edittingPlayer);
	const setEdittingPlayer = usePlayerStore(store => store.setEdittingPlayer);
	const setEdittingPlayers = usePlayerStore(store => store.setEdittingPlayers);
	const [ selectedPlayer, setSelectedPlayer ] = useState<string>("");
	const selectPlayer = (player: string) => {
		if (selectedPlayer === player)
			setSelectedPlayer("");
		else
			setSelectedPlayer(player);
	};
	const addPlayer = () => {

	};
	const deletePlayer = () => {

	};
	const editPlayer = () => {
		if (selectedPlayer) setEdittingPlayer(allPlayers?.find((p) => p.name === selectedPlayer));
		setSelectedPlayer("");
	};

	if (edittingPlayer) {
		return <PlayerDetailsScreen player={edittingPlayer} />
	}

	return (
		<RootDiv>
			<GameTitle>
				<GamePlayers>
					Edit Players
				</GamePlayers>
			</GameTitle>
			<Slider>
				{allPlayers?.map((player) => (
					<PlayerButton
						key={player.name}
						onClick={() => selectPlayer(player.name)}
						className={selectedPlayer === player.name ? "selected" : ""}
						>
							{selectedPlayer === player.name && "*"}
							{player.name}
					</PlayerButton>
				))}
			</Slider>
			<BackButton onClick={() => setEdittingPlayers(false)} />
			<ButtonRow>
				<EditButton
					disabled={selectedPlayer === ""}
					variant="contained"
					onClick={() => editPlayer()}
					>
					Edit
				</EditButton>
				<DeleteButton
					disabled={selectedPlayer === ""}
					variant="contained"
					onClick={() => deletePlayer()}
					>
					Delete
				</DeleteButton>
				<Space />
				<AddButton
					variant="contained"
					onClick={() => addPlayer()}
					>
					Add Player
				</AddButton>
			</ButtonRow>
		</RootDiv>
	);
}

export default EditPlayersScreen;




