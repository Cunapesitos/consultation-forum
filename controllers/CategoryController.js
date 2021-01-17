'use strict'

var Validator = require('Validator');
var CategoryModel = require('../models/CategoryModel');
var UserModel = require('../models/UserModel');
let pejs = require('pejs');
var views = pejs();
var user = new UserModel();
var category = new CategoryModel();

class CategoryController {

    search = async (req, res) => {
        let word = req.params.word;
        var categories = await category.search(word);
        return this.sendResponse(res, 200, "Categories found.", { categories: categories });
    }

    sendResponse = (res, code, message, body = {}) => {
        console.log("Sending response:" + message);
        res.statusCode = code;
        res.setHeader('Content-type', 'application/json');
        let response = JSON.stringify({
            message: message,
            body: body
        });
        res.end(response);
    }

    sendView = (res, file, data = {}) => {
        console.log("Sendingd view:" + file);
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

module.exports = CategoryController;