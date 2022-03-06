import styled from '@emotion/styled';

const ListDiv = styled.div`
	display: flex;
	flex-direction: column;
`;

const Title = styled.div`
	font-weight: bold;
`;

const ListItem = styled.div`
	
`;

interface ListProps {
	title: string;
	list: string[];
}

function List(props: ListProps) {
	return (
		<ListDiv>
			<Title>{props.title}</Title>
			{props.list.map(str => (
				<ListItem key={str}>{str}</ListItem>
			))}
		</ListDiv>
  );
}

export default List;




