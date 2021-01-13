'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function (user) {
    var payload = {
        sub: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(12, process.env.APP_PRODUCTION ? 'hours' : 'minutes').unix()
    };
    return jwt.encode(payload, process.env.APP_SECRET_JWT_KEY);
};