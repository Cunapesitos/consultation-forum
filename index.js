'use strict'

require('dotenv').config()

var migrations = require('./db/migrations');

migrations.execute();

const http = require('http');
var nStatic = require('node-static');
var fileServer = new nStatic.Server('./public');
const UserController = require('./controllers/user-controller');
const userController = new UserController();

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

const server = http.createServer((req, res) => {
    handleRequest(req, res);
});

server.listen(port, host, () => { console.log(`Server running at http://${host}:${port}/`); });

async function handleRequest(req, res) {
    switch (req.method) {
        case 'GET':
            await handleGet(req, res);
            break;
        case 'POST':
            await handlePost(req, res);
            break;
        default:
            await routeNotFound(req, res);
            break;
    }
}

async function handleGet(req, res) {
    switch (req.url) {
        case '/': redirectTo(res, '/login'); break;
        case '/echo': sendEcho(res); break;
        case '/login': userController.loginForm(req, res); break;
        case '/register': userController.registerForm(req, res); break;
        default: handleRouteWithParams(req, res); break;
    }
}

async function handlePost(req, res) {
    switch (req.url) {
        case '/login': userController.login(req, res); break;
        case '/register': userController.register(req, res); break;
        default: routeNotFound(req, res); break;
    }
}

async function handleRouteWithParams(req, res) {
    if (req.url.match(/\/alfa\/\w+/)) {
        const id = req.url.split('/')[2];
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.end(id);
    } else {
        fileServer.serve(req, res);
        // routeNotFound(req, res);
    }
}

function routeNotFound(req, res) {
    res.statusCode = 404;
    res.setHeader('Content-type', 'application/json');
    res.end('Route not found.');
}

function redirectTo(res, route) {
    res.writeHead(301, { 'Location': route });
    res.end();
}

function sendEcho(res) {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.end('All ok.');
}
