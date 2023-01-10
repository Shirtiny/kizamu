import { FC, memo } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";

const StyledLatest = styled.div``;

interface ILatestProps {}

const Latest: FC<ILatestProps> = () => {
  return (
    <StyledLatest>
      Latest
      <Button
        onClick={() => {
          throw new Error("test");
        }}
      >
        Throw Error
      </Button>
    </StyledLatest>
  );
};

export default memo(Latest);
