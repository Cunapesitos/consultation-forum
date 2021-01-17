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
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

class GroupController {

    registerView = (req, res) => {
        this.sendView(res, 'register');
    }

    register = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendView(res, "register", { errors: { name: ["Name is required."] } });
        let name = request.name;
        if (!name)
            return this.sendView(res, "register", { errors: { name: ["Name is required."] } });
        var categoriesString = request.categories;
        if (!categoriesString)
            return this.sendView(res, 'register', { errors: { category_id: ["Categories are required."] } });
        request.name = request.name.split(' ').join('');
        delete request.categories;
        var v = Validator.make(request, {
            name: 'required|alpha',
            user_id: 'required|numeric'
        });
        if (v.fails())
            return this.sendView(res, "register", v.getErrors());
        request.name = name;
        var categories = categoriesString.split('-');
        if (!categories[0])
            return this.sendView(res, 'register', { errors: { category_id: ["Categories are required."] } });
        let newGroup = await group.create(request);
        var bar = new Promise((resolve, reject) => {
            categories.forEach(async (element, index, array) => {
                if (element)
                    await groupCategory.createFromAGroup(newGroup.id, element);
                if (index === array.length - 1) resolve();
            });
        });
        bar.then(async () => {
            let userOwner = await user.getUserById(request.user_id);
            let groupCategories = await category.getFromGroupId(newGroup.id);
            let publications = await publication.getFromGroupId(newGroup.id);
            this.sendView(res, 'group', {
                group: newGroup,
                user: userOwner,
                categories: groupCategories,
                publications: publications
            });
        });
    }

    registerPublication = async (req, res) => {
        let request = req.body;
        if (request == undefined)
            return this.sendView(res, "register");
        var v = Validator.make(request, {
            title: 'required',
            content: 'required',
            user_id: 'required|numeric',
            category_id: 'required|numeric',
            group_id: 'required|numeric'
        });
        console.log("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
        if (v.fails()) {
            console.log("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
            let groupFound = await group.getFromId(req.body.group_id);
            if (!groupFound)
                return this.sendView(res, 'not-found');
            let userOwner = await user.getUserById(groupFound.user_id);
            let groupCategories = await category.getFromGroupId(groupFound.id);
            let publications = await publication.getFromGroupId(groupFound.id);
            this.sendView(res, 'group', {
                group: groupFound,
                user: userOwner,
                categories: groupCategories,
                publications: publications,
                errors: v.getErrors()
            });
        } else {
            console.log("ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd");
            let publicationSaved = await publication.create(request);
            console.log("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
            let groupFound = await group.getFromId(req.body.group_id);
            if (!groupFound)
                return this.sendView(res, 'not-found');
            let userOwner = await user.getUserById(groupFound.user_id);
            let groupCategories = await category.getFromGroupId(groupFound.id);
            let publications = await publication.getFromGroupId(groupFound.id);
            this.sendView(res, 'group', {
                group: groupFound,
                user: userOwner,
                categories: groupCategories,
                publications: publications
            });
        }
    }

    search = async (req, res) => {
        let word = req.body.word;
        if (!word)
            return this.sendView(res, 'register', { errors: { word: ['A word is required.'] } });
        var groups = await group.search(word);
        var bar = new Promise((resolve, reject) => {
            groups.forEach(async (group, index, array) => {
                var categories = await category.getFromGroupId(group.id);
                group.categories = categories;
                if (index === array.length - 1) resolve();
            });
            resolve();
        });
        bar.then(() => {
            return this.sendView(res, "groups", { groups: groups });
        });
    }

    getGroup = async (req, res) => {
        let groupFound = await group.getFromId(req.params.id);
        if (!groupFound)
            return this.sendView(res, 'not-found');
        let userOwner = await user.getUserById(groupFound.user_id);
        let groupCategories = await category.getFromGroupId(groupFound.id);
        let publications = await publication.getFromGroupId(groupFound.id);
        this.sendView(res, 'group', {
            group: groupFound,
            user: userOwner,
            categories: groupCategories,
            publications: publications
        });
    }

    getGroupsFromUserId = async (req, res) => {
        let userFound = await user.getUserById(req.params.id);
        if (!userFound)
            return this.sendView(res, 'not-found');
        var groups = await group.getFromUserId(userFound.id);
        if (!groups[0])
            return this.sendView(res, "groups", { groups: [] });
        var bar = new Promise((resolve, reject) => {
            groups.forEach(async (group, index, array) => {
                let categories = await groupCategory.getFromGroupId(group.id);
                group.categories = categories;
                if (index === array.length - 1) resolve();
            });
            resolve();
        });
        bar.then(() => {
            return this.sendView(res, "groups", { groups: groups });
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
            views.render(`./views/group/${file}`, myData, (error, str) => {
                res.status(200).send(str);
            });
    }

}

module.exports = GroupController;