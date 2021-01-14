'use strict'

var Validator = require('Validator');
var PublicationModel = require('../models/publication-model');
var UserModel = require('../models/user-model');
var CommentModel = require('../models/comment-model');
var PublicationCategoryModel = require('../models/publication-category-model');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var publication = new PublicationModel();
var comment = new CommentModel();
var publicationCategory = new PublicationCategoryModel();

class PublicationController {

    registerView = (res) => {
        this.sendView(res, 'register');
    }

    register = async (req, res) => {
        let request = (await this.getRequest(req)).data;
        //console.log("request:");
        //console.log(request);
        if (request == undefined)
            return this.response(res, 400, "Validation failed.", { data: {} });
        var v = Validator.make(request, {
            title: 'required',
            content: 'required',
            user_id: 'required|numeric'
        });
        try {
            var categoriesFromPublication = request.categories;
            delete request.categories;
            if (v.fails())
                return this.sendResponse(res, 400, "Validation failed.", v.getErrors());
            var newPublication = await publication.create(request);
            categoriesFromPublication.forEach(element => {
                v = Validator.make(element, {
                    id: 'required|numeric'
                });
                if (v.fails())
                    return this.sendResponse(res, 400, "Validation failed.", v.getErrors());
            });
            try {
                publicationCategory.createFromAPublication(newPublication.id, categoriesFromPublication);
            } catch (e) {
                return this.sendResponse(res, 500, e.message, e);
            }
            return this.sendResponse(res, 201, "Publication created.", newPublication);
        } catch (e) {
            return this.sendResponse(res, 500, e.message, e);
        }
    }

    publicationsView = (res) => {
        this.sendView(res, 'mine');
    }

    getPublicationsFromUserId = async (res, userId) => {
        let userOwner = await user.getUserById(userId);
        if (!userOwner)
            return this.sendView(res, 'not-found');
        try {
            let publications = await publication.getFromUserId(userId);
            this.sendView(res, 'publications', {
                publications: publications,
                user: userOwner
            });
        } catch (e) {
            this.sendResponse(res, 500, e.message, e);
        }
    }

    getPublication = async (res, id) => {
        let publicationFound = await publication.getFromId(id);
        if (!publicationFound)
            return this.sendView(res, 'not-found');
        let userOwner = await user.getUserById(publicationFound.user_id);
        let publicationComments = await comment.getFromPublicationId(id);
        let publicationCategories = await publicationCategory.getFromPublicationId(id);
        this.sendView(res, 'publication', {
            publication: publicationFound,
            user: userOwner,
            comments: publicationComments,
            categories: publicationCategories
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

    sendView = (res, file, data) => {
        console.log("Sending view:" + file);
        var myData = { data, host: process.env.APP_HOST };
        //console.log(myData);
        if (file != 'not-found')
            views.render(`./views/publication/${file}`, myData, (error, str) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/html');
                res.end(str);
            });
        else
            views.render(`./views/${file}`, myData, (error, str) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/html');
                res.end(str);
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