"use client";
import { HashRouter } from "react-router-dom";
import styled from "styled-components";
import TickAside from "@/components/tick/Aside";

const StyledTickAppLayout = styled.div`
  height: 100vh;
  width: 100vw;
  padding: .32rem .24rem;
  overflow: auto;
  background-color: var(--color-primary-background-color-dark);
  transition: background-color 0.4s ease-in-out;

  .container {
    min-height: 100%;
    display: flex;
    background-color: var(--color-primary-background-color);
    transition: background-color 0.4s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.25) 0rem .25rem .5rem -0.12rem;

    .aside {
      width: 1rem;
    }

    .main {
      flex: 1;
      overflow: hidden;
    }
  }
`;

export default function TickAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HashRouter>
      <StyledTickAppLayout>
        <div className="container">
          <aside className="aside">
            <TickAside />
          </aside>
          <div className="main">{children}</div>
        </div>
      </StyledTickAppLayout>
    </HashRouter>
  );
}
