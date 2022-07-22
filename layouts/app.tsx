import { FC, useMemo } from "react";
import { styled } from "@linaria/react";
import NextImage from "next/image";

const StyledAppLayout = styled.div``;

interface IProps {}

const AppLayout: FC<IProps> = () => {
  return (
    <StyledAppLayout>
      <NextImage
        src="https://picsum.photos/300"
        width={300}
        height={300}
        alt="random"
      />
    </StyledAppLayout>
  );
};

export default AppLayout;
