'use strict'

var Validator = require('Validator');
var CategoryModel = require('../models/category-model');
var UserModel = require('../models/user-model');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var category = new CategoryModel();

class CategoryController {

    getAll = async (res) => {
        var categories = await category.readAll();
        return this.sendResponse(res, 200, "Categories found.", categories);
    }

    register = async (req, res) => {
        let request = (await this.getRequest(req)).data;
        console.log("request:");
        console.log(request);
        if (request == undefined)
            return this.response(res, 400, "Validation failed.", { data: {} });
        var v = Validator.make(request, {
            content: 'required',
            publication_id: 'required|numeric',
            user_id: 'required|numeric',
        });
        if (v.fails())
            return this.sendResponse(res, 400, "Validation failed.", v.getErrors());
        try {
            var newComment = await comment.create(request);
            return this.sendResponse(res, 201, "Comment created.", newComment);
        } catch (e) {
            return this.sendResponse(res, 500, e.message, e);
        }
    }

    publicationsView = (res) => {
        this.sendView(res, 'mine');
    }

    getPublicationsFromUserId = async (res, userId) => {
        let publications = await publication.getFromUserId(userId);
        let userOwner = await user.getUserById(userId);
        this.sendView(res, 'publications', {
            publications: publications,
            user: userOwner
        });
    }

    getPublication = async (res, id) => {
        let publicationFound = await publication.getFromId(id);
        let userOwner = await user.getUserById(publicationFound.user_id);
        this.sendView(res, 'publication', {
            publication: publicationFound,
            user: userOwner
        });
    }

    sendResponse = (res, code, message, body = {}) => {
        res.statusCode = code;
        res.setHeader('Content-type', 'application/json');
        let response = JSON.stringify({
            message: message,
            body: body
        });
        console.log("response:");
        console.log(JSON.parse(response));
        res.end(response);
    }

    sendView = (res, file, data) => {
        console.log("Returning view:" + file);
        views.render(`./views/publication/${file}`, data, (error, str) => {
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

module.exports = CategoryController;