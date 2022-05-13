import { useEffect, useState } from 'react';
import styled from '@emotion/styled/macro';
import { PopupMessage, useConnectionStore } from '../store/ConnectionStore';

const PopupRoot = styled.div`
	display: none;
	position: fixed;
	overflow: hidden;
	left: 50%;
	top: 10%;
	//width: 75%;
	//height: 75%;
	transform: translateX(-50%);
	background: #18181899;
	transition: transform 500ms ease-in-out;
	padding: 50px 100px;
	border-radius: 10px;
    box-shadow: 0 0 10px #0004;
    align-items: center;
    justify-content: center;
	font-size: 100px;
	pointer-events: none;
	opacity: 0%;
	white-space: nowrap;
	&.open {
		display: flex;
		animation: fadeInOutAnim 2s ease 0s 1 normal forwards;

	}
`;

function Popup() {
	const [ open, setOpen ] = useState(false);
	const [popupMessage, setPopupMessage ] = useState<PopupMessage>();
	const storePopupMessage = useConnectionStore(store => store.popupMessage);
	const setStorePopupMessage = useConnectionStore(store => store.setPopupMessage);

	useEffect(() => {
		if (storePopupMessage) {
			setPopupMessage(storePopupMessage);
			setStorePopupMessage(undefined);
		}
	}, [setPopupMessage, setStorePopupMessage, storePopupMessage]);

	useEffect(() => {
		if (popupMessage) {
			setOpen(false);
			setTimeout(() => {
				setOpen(true);
			}, 10);
		}
	}, [popupMessage]);

	return (
		<PopupRoot className={open ? "open" : ""} >
			{ popupMessage?.message ?? "" }
		</PopupRoot>
	);
}

export default Popup;




