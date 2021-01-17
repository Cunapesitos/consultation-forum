'use strict'

var Validator = require('Validator');
var UserModel = require('../models/UserModel');
var PublicationModel = require('../models/PublicationModel');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var publication = new PublicationModel();
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

class UserController {

    registerView = (req, res) => {
        this.sendView(res, 'register');
    }

    register = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendView(res, "register", { data: {} });
        var name = request.name;
        var lastname = request.lastname;
        request.name = request.name.split(' ').join('');
        request.lastname = request.lastname.split(' ').join('');
        var v = Validator.make(request, {
            name: 'required|alpha',
            lastname: 'required|alpha',
            email: 'required|email',
            password: 'required|confirmed'
        });
        if (v.fails())
            return this.sendView(res, "register", { errors: v.getErrors() });
        request.name = name;
        request.lastname = lastname;
        try {
            var newUser = await user.create(request);
            return this.sendView(res, "login", { message: "Please login." });
        } catch (e) {
            if (e.code == 'ER_DUP_ENTRY')
                return this.sendView(res, "register", {
                    errors: {
                        email: ["Email already used."]
                    }
                });
            return this.sendView(res, 'register');
        }
    }

    loginView = (req, res) => {
        localStorage.setItem('user', 'null');
        this.sendView(res, 'login');
    }

    login = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendResponse(res, 400, "Validation failed.", { data: {} });
        var v = Validator.make(request, {
            email: 'required|email',
            password: 'required',
        });
        if (v.fails()) {
            return this.sendView(res, 'login', { errors: v.getErrors() });
        }
        let userLogin = await user.getUserByEmail(request.email);
        if (!userLogin)
            return this.sendView(res, 'login', { errors: { email: ["Email not registered.", request.email] } });
        let userId = userLogin.id;
        let isCorrectPassword = await user.isCorrectPassword(request.password, userId);
        if (!isCorrectPassword) {
            return this.sendView(res, 'login', { errors: { password: ["Incorrect password."] } });
        }
        let publications = await publication.getFromUserId(userId);
        localStorage.setItem('user', JSON.stringify(userLogin));
        return this.sendView(res, 'profile', { publications, user: userLogin });
    }

    search = async (req, res) => {
        let word = req.body.word;
        if (!word) {
            let userId = JSON.parse(localStorage.getItem('user')).id;
            let userOwner = await user.getUserById(userId);
            if (!userOwner)
                return this.sendView(res, 'not-found');
            let publications = await publication.getFromUserId(userId);
            return this.sendView(res, 'profile', {
                user: userOwner,
                publications: publications
            });
        } else {
            var users = await user.search(word);
            return this.sendView(res, "users", { users: users });
        }
    }

    profile = async (req, res) => {
        let userId = req.params.id;
        let userOwner = await user.getUserById(userId);
        if (!userOwner)
            return this.sendView(res, 'not-found');
        let publications = await publication.getFromUserId(userId);
        return this.sendView(res, 'profile', {
            user: userOwner,
            publications: publications
        });
    }

    sendView = (res, file, data = {}) => {
        console.log("Sending view: " + file);
        var user = localStorage.getItem('user') == 'null' ? undefined : JSON.parse(localStorage.getItem('user'));
        var myData = { user, data, host: process.env.APP_HOST };
        console.log("With:");
        console.log(myData);
        if (file == 'not-found')
            views.render(`./views/${file}`, myData, (error, str) => {
                res.status(200).send(str);
            });
        else
            views.render(`./views/user/${file}`, myData, (error, str) => {
                res.status(200).send(str);
            });
    }

}

module.exports = UserController;