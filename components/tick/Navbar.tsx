import { FC, memo, useCallback, useMemo } from "react";
import { styled } from "@linaria/react";
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
  margin: 4.375rem 0;
  text-align: center;
  overflow-y: auto;
  .nav-item {
    position: relative;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 4.6875rem;
    width: 4.6875rem;
    white-space: nowrap;
    transform: rotate(-90deg);
    color: #8b8b8b;
    letter-spacing: 0.0625rem;
    font-family: "Lexend", sans-serif;
    text-transform: capitalize;
    /* &::first-letter {
        text-transform: uppercase;
      } */
    &:not(:last-child) {
      margin-bottom: 2rem;
    }
    &.active {
      color: #ff7576;
    }
    &.dot {
      &::before {
        display: block;
        content: "";
        position: absolute;
        top: 38%;
        right: 0.5rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: #ff7576;
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
  }, [currentLocation]);

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