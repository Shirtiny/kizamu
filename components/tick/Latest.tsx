import { FC, memo } from "react";
import styled from "styled-components";

const StyledLatest = styled.div``;

interface ILatestProps {}

const Latest: FC<ILatestProps> = () => {
  return <StyledLatest>Latest</StyledLatest>;
};

export default memo(Latest);
