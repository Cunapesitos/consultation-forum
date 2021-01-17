'use strict'

var Validator = require('Validator');
var UserModel = require('../models/user-model');
var PublicationModel = require('../models/publication-model');
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
        let request = (await this.getRequest(req)).data;
        //console.log("request:");
        //console.log(request);
        if (request == undefined)
            return this.response(res, 400, "Validation failed.", { data: {} });
        var name = request.name;
        var lastname = request.lastname;
        request.name = request.name.split(' ').join('');
        request.lastname = request.lastname.split(' ').join('');
        var v = Validator.make(request, {
            name: 'required|alpha',
            lastname: 'required|alpha',
            email: 'required|email',
            password: 'required|confirmed',
            // role: 'required|alpha',
        });
        if (v.fails())
            return this.sendResponse(res, 400, "Validation failed.", v.getErrors());
        request.name = name;
        request.lastname = lastname;
        try {
            var newUser = await user.create(request);
            return this.sendResponse(res, 201, "User created.", newUser);
        } catch (e) {
            if (e.code == 'ER_DUP_ENTRY')
                return this.sendResponse(res, 400, "Email is already taken.", {
                    email: ["Email already used."]
                });
            return this.sendResponse(res, 500, e.message, e);
        }
    }

    loginView = (req, res) => {
        localStorage.setItem('user', 'null');
        this.sendView(res, 'login');
    }

    login = async (req, res) => {
        let request = req.body;
        console.log(request);
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
        return this.sendView(res, 'profile', { publications });
    }

    search = async (res, word) => {
        var users = await user.search(word);
        return this.sendResponse(res, 200, "Users found.", { users: users });
    }

    profile = async (req, res) => {
        let userId = req.params.id;
        try {
            let userOwner = await user.getUserById(userId);
            if (!userOwner)
                return this.sendView(res, 'not-found');
        } catch (e) {
            return this.sendView(res, 'not-found');
        }
        try {
            let publications = await publication.getFromUserId(userId);
            this.sendView(res, 'profile', {
                publications: publications
            });
        } catch (e) {
            return this.sendView(res, 'not-found');
        }
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