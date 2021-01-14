'use strict'

require('dotenv').config()

var migrations = require('./db/migrations');

migrations.execute();

const http = require('http');
var nodeStatic = require('node-static');
var authMid = require('./auth/middleware');
var fileServer = new nodeStatic.Server('./public');
const Controller = require('./controllers/controller');
const UserController = require('./controllers/user-controller');
const PublicationController = require('./controllers/publication-controller');
const CommentController = require('./controllers/comment-controller');
const CategoryController = require('./controllers/category-controller');
const userController = new UserController();
const controller = new Controller();
const publicationController = new PublicationController();
const commentController = new CommentController();
const categoryController = new CategoryController();

const host = process.env.APP_HOST || 'http://localhost';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    handleRequest(req, res);
});

server.listen(port, () => {
    console.log(`Server running at ${host}:${port}/`);
});

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
        case '/': controller.redirectTo(res, '/login'); break;
        case '/echo': controller.sendEcho(res); break;
        case '/me': authMid.authenticate(req, res); break;
        case '/register': userController.registerView(res); break;
        case '/login': userController.loginView(res); break;
        case '/home': publicationController.publicationsView(res); break;
        case '/publication': publicationController.registerView(res); break;
        case '/categories': categoryController.getAll(res); break;
        default: handleRouteWithParams(req, res); break;
    }
}

async function handlePost(req, res) {
    switch (req.url) {
        case '/register': userController.register(req, res); break;
        case '/login': userController.login(req, res); break;
        case '/comment': commentController.register(req, res); break;
        case '/publication': publicationController.register(req, res); break;
        default: routeNotFound(req, res); break;
    }
}

async function handleRouteWithParams(req, res) {
    if (req.url.match(/\/publications\/([0-9]+)+/)) {
        const id = req.url.split('/')[2];
        console.log(req.url);
        return publicationController.getPublicationsFromUserId(res, id);
    } else if (req.url.match(/\/publication\/([0-9]+)+/)) {
        const id = req.url.split('/')[2];
        console.log(req.url);
        return publicationController.getPublication(res, id);
    } else {
        fileServer.serve(req, res, (error, response) => {
            if (error && (error.status === 404)) {
                controller.sendView(res, 'not-found');
            }
        });
    }
}
