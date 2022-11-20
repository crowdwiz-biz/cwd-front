CrowdWiz-UI
============

This is a light wallet that connects to a CrowdWiz API provided by the *witness_node* executable.

It *stores all keys locally* in the browser, *never exposing your keys to anyone* as it signs transactions locally before transmitting them to the API server which then broadcasts them to the blockchain network. The wallet is encrypted with a password of your choosing and encrypted in a browser database.

## Getting started

CrowdWiz-UI depends node Node.js, and version 8+ is required.

On Ubuntu and OSX, the easiest way to install Node is to use the [Node Version Manager](https://github.com/creationix/nvm).

To install NVM for Linux/OSX, simply copy paste the following in a terminal:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
nvm install v11.14
nvm use v11.14
```

Before launching the GUI you will need to install the npm packages:

```
npm install
```

## Running the dev server

The dev server uses Express in combination with Webpack.

Once all the packages have been installed you can start the development server by running:

```
npm start
```
### Docker

```
git clone https://github.com/crowdwiz-biz/cwd-front.git
cd cwd-front
docker run -it --rm --name cwd-front -v "$PWD":/usr/src/app -w /usr/src/app -p 8090:8090 node:11 npm install
docker run -it --rm --name cwd-front -v "$PWD":/usr/src/app -w /usr/src/app -p 8090:8090 node:11 npm start
```

Once the compilation is done the GUI will be available in your browser at: `localhost:8090` or `127.0.0.1:8090`. Hot Reloading is enabled so the browser will live update as you edit the source files.


## Production
If you'd like to host your own wallet somewhere, you should create a production build and host it using NGINX or Apache. In order to create a prod bundle, simply run the following command:

```
npm run build
```
This will create a bundle in the ./build/dist folder that can be hosted with the web server of your choice.