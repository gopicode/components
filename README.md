# Overview

Using modern javascript syntax directly in the browser without using any transpiler (like Babel). `React.createElement` is used as helper function `h` instead of JSX syntax. The react and react-dom libraries are include directly in the index.html file. Hence, they are globally available.

For bundling, [rollup](https://rollupjs.org) is used along with [postcss](https://www.npmjs.com/package/rollup-plugin-postcss) plugin. The modules are simply merged inside a single IIFE wrapper. Follow [BEM](http://getbem.com/introduction/) convention for the css/styles.

# Build

```bash
npm install
npm run build
npm start
```

# Devlopment

Open a terminal tab and run below. This will start the server
```bash
npm start
```

Open another terminal tab and run below. This will start the rollup in watch mode. Any code change in the src folder will be rebuilt automatically.
```bash
npm run dev
```

Open http://localhost:4000 in the browser
