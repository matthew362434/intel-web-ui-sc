# Recommended Project Structure

```
project_root
├── docs
├── public
│   └── static
├── src
│   ├── assets
│   ├── api
│   │   ├── project
│   │   │   ├── index.ts
│   │   │   ├── fetchProject.ts
│   │   │   └── createProject.ts
│   │   └── makeRequest.ts
│   ├── components
│   │   └── Project
│   │       ├── Project.ts
│   │       ├── Project.styles.ts
│   │       ├── CreateProject.ts
│   │       └── CreateProject.styles.ts
│   ├── constants
│   ├── hooks
│   ├── routes
│   ├── helpers
│   ├── store
│   │   ├── slices
│   │   │   └── project
│   │   │       ├── actions.ts
│   │   │       ├── reducer.ts
│   │   │       └── selectors.ts
│   │   ├── store.ts
│   │   ├── initial-state.ts
│   │   └── root-reducer.ts
│   ├── styles
│   │   └── theme.ts
│   ├── test
│   │   └── test-utils.ts
│   ├── environment.ts
│   └── types
├── .env.development
├── .env.production
├── .env.example
├── package.json
├── README.md
├── tsconfig.json
└── other extra config files
```

## Source Code Modules

### `/api`

This directory should contain a `makeRequest.js` (filename not set in stone) which exports a function that wraps an HTTP request library such as `axios` or `superagent`.

For TypeScript projects, consider also adding a `response-types` directory, which contains common typings/interfaces that are expected to be returned in the JSON payloads contained in API responses.

Non-TypeScript projects, on the other hand, may consider a `response-factories` directory which exports factory functions that take JSON payloads as arguments and return data types to be used throughout the rest of the front end.

The bulk of the `/api` directory will consist of files or subdirectories which export API clients (see the code example in the `index.js` files section above).

### `/components`

This directory should be as flat as possible. But there may be some larger modules that require nesting. For example, a `/pages` subdirectory may be appropriate for an app with distinct pages and routing (like the Admin and Partner Portals). A `/features` or `/views` subdirectory may be more appropriate for a single-page app like the Expert Portal. Other possible exceptions may be `/forms` and `/svg` directories.

### `/constants`

Constants that are used in multiple files should live here.

Constants (including "constants" that are essentially object enums) should follow the Airbnb [JavaScript Style Guide](https://github.com/airbnb/javascript#naming--uppercase).

```js
// bad
const PRIVATE_VARIABLE = 'should not be unnecessarily uppercased within a file';

// good
export const API_KEY = 'SOMEKEY';

// bad - unnecessarily uppercases key while adding no semantic value
export const MAPPING = {
  KEY: 'value'
};

// good
export const MAPPING = {
  key: 'value'
};
```