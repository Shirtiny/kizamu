# Use linaria with Next.js

## Install

```bash
yarn add @linaria/core @linaria/react
yarn add -D @linaria/babel-preset @linaria/shaker @linaria/webpack-loader next-linaria@1.0.0-beta
```

## Config

- .babelrc

```json
{
  "presets": ["next/babel", "@linaria"],
  "plugins": []
}
```

- next.config.js

```js
/** @type {import('next').NextConfig} */

const withLinaria = require("next-linaria");

const nextConfig = {
  linaria: {
    /* linaria options here */
  },
};

module.exports = withLinaria(nextConfig);
```

## Usage

```typescript
import { NextPage } from "next";
import { css } from "@linaria/core";
import styled from "styled-components";

const StyledHome = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: azure;
  color: #ffffff;
`;

const Home: NextPage = () => {
  return <StyledHome>hello</StyledHome>;
};

export default Home;
```
