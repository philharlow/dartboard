import { PropsWithChildren, useEffect, useState } from 'react';
import styled from '@emotion/styled/macro';

const DrawerRoot = styled.div`
	position: fixed;
	overflow: hidden;
	background: #18181899;
	transition: transform 500ms ease-in-out;
	padding: 10px;
	border-radius: 10px;
    box-shadow: 0 0 10px #0004;
	&.right {
		right: 0px;
	}
	&.left {
		left: 0px;
	}
	&.bottom {
		bottom: 0px;
	}
	&.top {
		top: 0px;
	}
`;

const DrawerDiv = styled(DrawerRoot)`
	z-index: 10;
	&.right {
		transform: translateX(110%);
		&.open {
			transform: translateX(0%);
		}
	}
	&.left {
		transform: translateX(0%);
		&.open {
			transform: translateX(100%);
		}
	}
	&.bottom {
		transform: translateY(110%);
		&.open {
			transform: translateY(0%);
		}
	}
	&.top {
		transform: translateY(-110%);
		&.open {
			transform: translateY(0%);
		}
	}
`;
const DrawerTab = styled(DrawerRoot)`
	&.right {
    	margin-right: -10px;
		transform: translateX(0%);
		&.open {
			transform: translateX(100%);
		}
	}
	&.left {
    	margin-left: -10px;
		transform: translateX(100%);
		&.open {
			transform: translateX(0%);
		}
	}
	&.bottom {
    	margin-bottom: -10px;
		transform: translateY(0%);
		&.open {
			transform: translateY(100%);
		}
	}
	&.top {
    	margin-top: -10px;
		transform: translateY(0%);
		&.open {
			transform: translateY(-100%);
		}
	}
`;

const CloseButton = styled.div`
	position: absolute;
	top: 5px;
	right: 5px;
	width: 25px;
	height: 25px;
	background: #955a;
	border-radius: 20px;
    text-align: center;
    line-height: 19px;
	z-index: 1000;
`;

export enum DrawerPosition {
	Top = "top",
	Bottom = "bottom",
	Left = "left",
	Right = "right",
}

interface DrawerProps {
	tabLabel: string;
	position: DrawerPosition;
	tabStyle?: Partial<React.CSSProperties>;
	drawerStyle?: Partial<React.CSSProperties>;
}

function Drawer(props: PropsWithChildren<DrawerProps>) {
	const [ open, setOpen ] = useState(false);
	const [ drawerRendered, setDrawerRendered ] = useState(false);

	useEffect(() => {
		if (open) setDrawerRendered(true);
		else setTimeout(() => setDrawerRendered(false), 1000);
	}, [open]);

	const classes: string[] = [props.position];
	if (open)
		classes.push("open");

	return (
		<>
			<DrawerTab className={classes.join(" ")} style={{ ...props.tabStyle }} onClick={() => setOpen(!open)}>
				{props.tabLabel}
			</DrawerTab>
			<DrawerDiv className={classes.join(" ")} style={{ ...props.drawerStyle }}>
				<CloseButton onClick={() => setOpen(false)}>x</CloseButton>
				{drawerRendered && props.children}
			</DrawerDiv>
		</>
	);
}

export default Drawer;




