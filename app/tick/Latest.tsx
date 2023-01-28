import { FC } from "react";
import styled from "styled-components";
import Button from "@/components/common/Button";
import component from "@/hoc/component";

const StyledLatest = styled.div``;

interface IProps {}

const Latest: FC<IProps> = () => {
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

export default component<IProps>(Latest);
