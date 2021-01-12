'user strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var User = require('../models/user-model');
const UserController = require('../controllers/user-controller');
var key = process.env.APP_SECRET_JWT_KEY;

exports.authenticate = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({
            message: "Unauthorized.",
            body: req.body
        });
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, key);
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: "Token expired.",
                body: req.body
            });
        }
        User.findById(payload.sub, (error, doc) => {
            if (error)
                return res.status(500).send({
                    message: error.message,
                    body: error
                });
            if (!doc)
                return res.status(401).send({
                    message: "User not found, unauthorized.",
                    body: {}
                });
            req.user = payload;
            next();
        });
    } catch (ex) {
        return res.status(404).send({
            message: "Invalid token.",
            body: req.body
        });
    }
}