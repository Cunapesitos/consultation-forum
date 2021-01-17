'use strict'

let pejs = require('pejs');
var views = pejs();
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

class Controller {

    sendEcho = (res) => {
        this.sendResponse(res, 200, 'All ok.');
    }

    redirectToLogin = (req, res) => {
        res.writeHead(301, { 'Location': '/login' });
        res.end();
    }

    routeNotFound = (res) => {
        this.sendView(res, 'not-found');
    }

    sendResponse = (res, code, message, body = {}) => {
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
        console.log("Sending view:" + file);
        views.render(`./views/${file}`, { data, host: process.env.APP_HOST }, (error, str) => {
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

module.exports = Controller;