import { FC, memo } from "react";
import { styled } from "@linaria/react";
import AppRoutes from "../../router/AppRoutes";
import routerConfig from "../../router/config";

interface IStyledMainProps {}
const StyledMain = styled.div<IStyledMainProps>``;

interface ITickMainProps {}

const TickMain: FC<ITickMainProps> = () => {
  return (
    <StyledMain>
      <AppRoutes routes={routerConfig.tick} />
    </StyledMain>
  );
};

export default memo(TickMain);
