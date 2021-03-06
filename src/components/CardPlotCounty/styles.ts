import styled from 'styled-components';

interface ContainerProps {
  ishidden: number;
}

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  right: 0px;
  text-align: center;

  width: 80vw;
  position: absolute;
  z-index: 2;

  transform: translateX(${({ ishidden }) => (ishidden ? 80 : 0)}vw);
  transition: 0.3s;

  label {
    margin-top: 5px;

    @media screen and (max-width: 900px) {
      margin-left: 20px;
    }
  }

  #handleCardplot {
    position: absolute;
    z-index: 1;
    left: 5px;

    transform: translateX(${({ ishidden }) => (ishidden ? -30 : 0)}px);
    transition: 0.3s;

    svg {
      cursor: pointer;
      transform: rotate(${({ ishidden }) => (ishidden ? 180 : 0)}deg);
      margin-top: 10px;
      border-radius: 2px;
      background: #fff;
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.13),
        1px 2px 2px rgba(0, 0, 0, 0.1), -1px -2px 2px rgba(0, 0, 0, 0.05);
    }
  }
`;

export const Content = styled.div`
  overflow-y: auto;
  background: #fff;

  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.13), 1px 2px 2px rgba(0, 0, 0, 0.1),
    -1px -2px 2px rgba(0, 0, 0, 0.05);

  .final-space {
    padding-top: 40px;
  }
`;
