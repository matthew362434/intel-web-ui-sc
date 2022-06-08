# Getting Started with the Sonoma Creek Web UI

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Please make sure you're using the same node/npm versions as stated on `package.json`'s `engine` property.

After installing the project's dependencies with npm you'll want to setup a remote environment that runs the Sonoma Creek server.

For our general code style rules please see our [CONTRIBUTING.md](./CONTRIBUTING.md) document. When opening a merge request please follow the instructions on Gitlab or the [Developer guide - lines of code](./../docs/design/developers_guide_repo.md). This guide also includes instructions about running the end to end tests using the Jenkins CI for your branch.

## Setup your Sonoma Creek server (requires connection to the Intel VPN)

To setup your own Sonoma Creek environment go to the [Jenkins IMPTOps](https://ci.iotg.sclab.intel.com/job/IMPT/job/IMPTOps/build?delay=0sec) page and then:
1) Find the `OPERATION` field and change it from `test` to `platforminstaller` (if you already have a environment you can also update it to the latest develop using `platformupgrade`).
2) Click build and you'll notice that there is a new build that includes your Intel username (bottom left).

Installing the platform can take a while, but once it's done your environment should be listed on the [environments page](https://environments.toolbox.iotg.sclab.intel.com/). Here you can search for you Intel username to get the server's address.

## Configuring your local environment to use a remote Sonoma Creek server

Now that you've setup your environment you'll want to use it for your local development.

1. Setup a proxy
2. Change your browser's response headers

### Setup a proxy

In the root directory (the same level as `package.json`) create a file `.env.development.local`.
Copy the next line into it, replacing this ip by your environment's ip.

```
  REACT_APP_API_PROXY=https://10.91.242.25/
```

Use IP address or DNS name of server, created on a previous step. 
Once this is done Create React App will proxy any API requests that weren't handled by localhost to this server instead.

#### Configuring the proxy to use a custom user

You may want to configure the proxy to use a custom user instead of the default `admin@sc-project.intel.com`. 
This can be useful if you are sharing the same platform with another colleague (the authentication service has some security configuration that makes it difficult to login with a single account from multiple browsers).

To do this configure you `.env.development.local` with,

```
SC_AUTH_LOGIN="hello@sc-project.intel.com"
SC_AUTH_PASSWORD="QFNDQWRtaW4="
```

Here the `SC_AUTH_PASSWORD` is the base64 encoded string of your password. You can use `btoa('your fancy passowrd')` to get this encoded string.

After configuring the login and password make sure to rerun `npm start`.

## Working with the REST API

The REST API is documented using the OpenAPI spec. You can find it [here](https://gitlab.devtools.intel.com/vmc-eip/IMPT/impt/-/blob/develop/docs/rest/openapi.yaml).

## Working with the CI

## Eslint & prettier

We've configured React so that compilation (`npm start` or `npm build`) fails if eslint throws an error. You can also run the linter manually with `npm run eslint` or `npm run eslint:fix` if you'd like it to try and fix issues automatically.

Our eslint configuration also fails when prettier fails. It is advised to configure your editor to run prettier either when saving a file or before committing your code.

## Testing

We try to keep our unit code coverage high so that it will be easier to maintain the application.
Running the tests can be done with `npm test`, `npm run test:coverage` or `npm run test:watch`.

We use [jest](https://jestjs.io/), [testing-library](https://testing-library.com/) and [msw](https://mswjs.io/) when dealing with tests that send REST or GraphQL requests.

Note: We use [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks) which adds pre commit and pre push hooks after running `npm install`.
The pre push hook will run the tests before pushing your code while the pre commit hook only checks the linter.

## Troubleshooting

### Installing packages while connected to the Intel VPN

By adding the following exports to your bashrc file (or your other preferred shell) and with the project's .npmrc file, you can install npm packages without needing to disconnect from the Intel VPN.

#### For MAC/Linux

```bash
export http_proxy=http://proxy-iil.intel.com:911
export ftp_proxy=http://proxy-iil.intel.com:911
export https_proxy=http://proxy-iil.intel.com:912
export no_proxy=.intel.com,127.0.0.1,localhost,.nauta,10.0.0.0/8,pypi.sclab.intel.com
export HTTP_PROXY=http://proxy-iil.intel.com:911
export FTP_PROXY=http://proxy-iil.intel.com:911
export HTTPS_PROXY=http://proxy-iil.intel.com:912
export NO_PROXY=.intel.com,127.0.0.1,localhost,.nauta,10.0.0.0/8,pypi.sclab.intel.com
```

### Working on the annotator without a remote server

Sometimes it is more convenient to work without using a remote server (i.e. when the vpn is slow or if your server is upgrading).
For these circumstances we've added a "hack/feature" that lets you use an in memory version of the annotator services by visiting `localhost:3000/projects/test-project/annotator`.
This lets the `useAnnotatorServices` hook return in memory services instead of api services so that you can work on the annotator without requiring access to a working server.

Additionally you may set the `REACT_APP_VALIDATION_COMPONENT_TESTS` environment variable to `true` so that the application uses mocked values for projects, models and statistics.

### My server is too slow

By default Jenkins will build a `hyperv -- ubuntu_tiny` machine which doesn't have a lot of compute power. If you think you need a better machine you can try using a standard or multinode machine instead.
Additionally we have [bare metal machines](https://ci.iotg.sclab.intel.com/view/all/job/iotg-resources/job/impt/view/impt-resources/) which we can use for testing as well.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
