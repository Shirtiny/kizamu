import { FC, memo, ReactNode } from "react";
import { styled } from "@linaria/react";
import "@fontsource/lexend";
import "@fontsource/chilanka";
import "@fontsource/jetbrains-mono";

const StyledAppLayout = styled.div`
  :global() {
    html {
      font-size: 16px;
    }
    html,
    body {
      padding: 0;
      margin: 0;
      font-family: "JetBrains Mono", monospace, -apple-system,
        BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
        Fira Sans, Droid Sans, Helvetica Neue, sans-serif;

      /* font-family: "JetBrains Mono", monospace; */
      /* "Chilanka", cursive */
      /* "Lexend", sans-serif,*/
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    * {
      box-sizing: border-box;
    }

    .flex-space {
      flex: 1;
    }
  }
`;

interface IProps {
  children?: ReactNode;
}

const AppLayout: FC<IProps> = ({ children }) => {
  return <StyledAppLayout>{children}</StyledAppLayout>;
};

export default memo(AppLayout);
