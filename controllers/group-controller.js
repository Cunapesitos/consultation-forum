'use strict'

var Validator = require('Validator');
var GroupModel = require('../models/group-model');
var GroupCategoryModel = require('../models/group-category-model');
var UserModel = require('../models/user-model');
var CategoryModel = require('../models/category-model');
var PublicationModel = require('../models/publication-model');
let pejs = require('pejs');
var views = pejs();
var group = new GroupModel();
var user = new UserModel();
var category = new CategoryModel();
var groupCategory = new GroupCategoryModel();
var publication = new PublicationModel();

class GroupController {

    registerView = (res) => {
        this.sendView(res, 'register');
    }

    register = async (req, res) => {
        let request = (await this.getRequest(req)).data;
        if (request == undefined)
            return this.response(res, 400, "Validation failed.", { data: {} });
        let name = request.name;
        request.name = request.name.split(' ').join('');
        var categories = request.categories;
        delete request.categories;
        var v = Validator.make(request, {
            name: 'required|alpha',
            user_id: 'required|numeric'
        });
        if (v.fails())
            return this.sendResponse(res, 400, "Validation failed.", v.getErrors());
        request.name = name;
        try {
            var newGroup = await group.create(request);
            categories.forEach(async element => {
                try {
                    await groupCategory.createFromAPublication(newGroup.id, element);
                } catch (e) {
                    return this.sendResponse(res, 500, e.message, e);
                }
            });
            return this.sendResponse(res, 201, "Group created.", newGroup);
        } catch (e) {
            return this.sendResponse(res, 500, e.message, e);
        }
    }

    search = async (res, word) => {
        var groups = await group.search(word);
        return this.sendResponse(res, 200, "Groups found.", { groups: groups });
    }

    getGroup = async (res, id) => {
        let groupFound = await group.getFromId(id);
        if (!groupFound)
            return this.sendView(res, 'not-found');
        let userOwner = await user.getUserById(groupFound.user_id);
        let groupCategories = await category.getFromGroupId(groupFound.id);
        let publications = await publication.getFromGroupId(groupFound.id);
        //TODO get all the user request
        this.sendView(res, 'group', {
            group: groupFound,
            user: userOwner,
            categories: groupCategories,
            publications: publications
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
        views.render(`./views/group/${file}`, { data, host: process.env.APP_HOST }, (error, str) => {
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

module.exports = GroupController;