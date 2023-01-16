import { FC, memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { cls } from "@shirtiny/utils/lib/style";
import Link from "../common/Link";
import ActiveBar from "../common/ActiveBar";
import routerConfig from "../../router/config";
import logger from "../../utils/logger";
import { IRoute } from "../../router/type";

const StyledNavbar = styled.div`
  position: relative;
  flex: 1;
  margin: .7rem 0;
  text-align: center;
  overflow-y: auto;
  .nav-item {
    position: relative;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: .75rem;
    width: .75rem;
    white-space: nowrap;
    transform: rotate(-90deg);
    color: var(--color-primary-text);
    letter-spacing: .01rem;
    font-family: "Lexend", sans-serif;
    text-transform: capitalize;
    transition: color 0.4s ease-in-out;
    /* &::first-letter {
        text-transform: uppercase;
      } */
    &:not(:last-child) {
      margin-bottom: .32rem;
    }
    &.active {
      color: var(--color-primary);
    }
    &.dot {
      &::before {
        display: block;
        content: "";
        position: absolute;
        top: 38%;
        right: .08rem;
        width: .08rem;
        height: .08rem;
        border-radius: 50%;
        background-color: var(--color-primary);
      }
    }
  }
`;

interface INavbarProps {}

const Navbar: FC<INavbarProps> = () => {
  const currentLocation = useLocation();

  const { currentActiveIndex } = useMemo(() => {
    let tempIndex = 0;
    const route = routerConfig.tick.find((r, index) => {
      const flag = r.path === currentLocation.pathname;
      if (flag) tempIndex = index;
      return flag;
    });
    logger.debug("current route", { route, currentActiveIndex: tempIndex });
    return { currentActiveIndex: tempIndex };
  }, [currentLocation.pathname]);

  return (
    <StyledNavbar className="nav">
      {routerConfig.tick.map((r, index) => {
        const isActive = index === currentActiveIndex;
        const className = cls("nav-item", { active: isActive });
        return (
          <Link key={r.key} className={className} href={r.path}>
            {r.label}
          </Link>
        );
      })}
      <ActiveBar currentActiveIndex={currentActiveIndex} />
    </StyledNavbar>
  );
};

export default memo(Navbar);
