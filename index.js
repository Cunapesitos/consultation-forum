'use strict'

require('dotenv').config()

var migrations = require('./db/migrations');
migrations.execute();

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

const Controller = require('./controllers/controller');
const UserController = require('./controllers/user-controller');
const PublicationController = require('./controllers/publication-controller');
const CommentController = require('./controllers/comment-controller');
const CategoryController = require('./controllers/category-controller');
const GroupController = require('./controllers/group-controller');
const userController = new UserController();
const controller = new Controller();
const publicationController = new PublicationController();
const commentController = new CommentController();
const categoryController = new CategoryController();
const groupController = new GroupController();

const host = process.env.APP_HOST || 'http://localhost';
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`App started.\nApp listening at ${host}`);
});

app.get('/', controller.redirectToLogin);
app.get('/echo', controller.sendEcho);
app.get('/register', userController.registerView);
app.get('/login', userController.loginView);
app.get('/logout', userController.loginView);
app.get('/publication', publicationController.registerView);
app.get('/publication/:id', publicationController.getPublication);
app.get('/group', groupController.registerView);
app.get('/group/:id', groupController.getGroup);
app.get('/groups/:id', groupController.getGroupsFromUserId);
app.get('/profile/:id', userController.profile);
app.get('/search/categories/:word', categoryController.search);

app.post('/register', userController.register);
app.post('/login', userController.login);
app.post('/publication', publicationController.register);
app.post('/comment', publicationController.registerComment);
app.post('/group', groupController.register);
app.post('/group/publication', groupController.registerPublication);
app.post('/search/groups', groupController.search);
app.post('/search/users', userController.search);
