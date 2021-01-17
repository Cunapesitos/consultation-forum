'use strict'

var Validator = require('Validator');
var PublicationModel = require('../models/publication-model');
var UserModel = require('../models/user-model');
var CommentModel = require('../models/comment-model');
var PublicationCategoryModel = require('../models/group-category-model');
var CategoryModel = require('../models/category-model');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var publication = new PublicationModel();
var comment = new CommentModel();
var publicationCategory = new PublicationCategoryModel();
var category = new CategoryModel();
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

class PublicationController {

    registerView = (req, res) => {
        this.sendView(res, 'register');
    }

    register = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendView(res, "register");
        var v = Validator.make(request, {
            title: 'required',
            content: 'required',
            user_id: 'required|numeric',
            category_id: 'required|numeric'
        });
        if (v.fails())
            return this.sendView(res, 'register', { errors: v.getErrors() });
        let newPublication = await publication.create(request);
        let userOwner = await user.getUserById(newPublication.user_id);
        let publicationComments = await comment.getFromPublicationId(newPublication.id);
        let categoryFound = await category.getFromPublicationId(newPublication.id);
        this.sendView(res, 'publication', {
            publication: newPublication,
            user: userOwner,
            comments: publicationComments,
            category: categoryFound
        });
    }

    registerComment = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendView(res, 'not-found');
        var v = Validator.make(request, {
            content: 'required',
            publication_id: 'required|numeric',
            user_id: 'required|numeric'
        });
        if (v.fails()) {
            let id = req.body.publication_id;
            let publicationFound = await publication.getFromId(id);
            if (!publicationFound)
                return this.sendView(res, 'not-found');
            let userOwner = await user.getUserById(publicationFound.user_id);
            let publicationComments = await comment.getFromPublicationId(id);
            let categoryFound = await category.getFromPublicationId(id);
            this.sendView(res, 'publication', {
                publication: publicationFound,
                user: userOwner,
                comments: publicationComments,
                category: categoryFound,
                errors: v.getErrors()
            });
        } else {
            var newComment = await comment.create(request);
            let id = req.body.publication_id;
            let publicationFound = await publication.getFromId(id);
            if (!publicationFound)
                return this.sendView(res, 'not-found');
            let userOwner = await user.getUserById(publicationFound.user_id);
            let publicationComments = await comment.getFromPublicationId(id);
            let categoryFound = await category.getFromPublicationId(id);
            this.sendView(res, 'publication', {
                publication: publicationFound,
                user: userOwner,
                comments: publicationComments,
                category: categoryFound
            });
        }
    }

    getPublication = async (req, res) => {
        let id = req.params.id;
        let publicationFound = await publication.getFromId(id);
        if (!publicationFound)
            return this.sendView(res, 'not-found');
        let userOwner = await user.getUserById(publicationFound.user_id);
        let publicationComments = await comment.getFromPublicationId(id);
        let categoryFound = await category.getFromPublicationId(id);
        this.sendView(res, 'publication', {
            publication: publicationFound,
            user: userOwner,
            comments: publicationComments,
            category: categoryFound
        });
    }

    sendResponse = (res, code, message, body = {}) => {
        console.log("Sending response:" + message);
        res.statusCode = code;
        res.setHeader('Content-type', 'application/json');
        let response = JSON.stringify({
            message: message,
            body: body
        });
        //console.log("response:");
        //console.log(JSON.parse(response));
        res.end(response);
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
            views.render(`./views/publication/${file}`, myData, (error, str) => {
                res.status(200).send(str);
            });
    }

    getRequest = (req) => {
        return new Promise((resolve, reject) => {
            try {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    let o = JSON.parse(body);
                    resolve(o);
                })
            } catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = PublicationController;