import styled from '@emotion/styled';

const BackButtonDiv = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #33333355;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

interface BackButtonProps {
  onClick: () => void;
}

function BackButton(props: BackButtonProps) {
  return (
    <BackButtonDiv onClick={props.onClick}>
      &lt;
    </BackButtonDiv>
  );
}

export default BackButton;
