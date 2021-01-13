'user strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var UserModel = require('../models/user-model');
var Controller = require('../controllers/controller');
var controller = new Controller();
var user = new UserModel();
var key = process.env.APP_SECRET_JWT_KEY;

exports.authenticate = async function (req, res, next = () => { }) {
    console.log("Headers.");
    console.log(req.headers);
    if (!req.headers.authorization) {
        return controller.sendResponse(res, 401, "Unauthorized.");
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, key);
        console.log(payload);
        if (payload.exp <= moment().unix()) {
            return controller.sendResponse(res, 401, "Your session has expired.");
        }
        let userVerifying = await user.getUserByEmail(payload.email);
        if (userVerifying.access_token == token)
            return controller.sendResponse(res, 200, "User ok.");
        return controller.sendResponse(res, 401, "Session expired.");
    } catch (ex) {
        return controller.sendResponse(res, 401, "Invalid token.");
    }
}