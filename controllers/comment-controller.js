'use strict'

var Validator = require('Validator');
var CommentModel = require('../models/comment-model');
var UserModel = require('../models/user-model');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var comment = new CommentModel();

class CommentController {

    register = async (req, res) => {
        let request = (await this.getRequest(req)).data;
        //console.log("request:");
        //console.log(request);
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
        views.render(`./views/publication/${file}`, { data, host: process.env.APP_HOST }, (error, str) => {
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

module.exports = CommentController;