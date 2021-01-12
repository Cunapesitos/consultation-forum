'use strict'

var connection = require('./connection').Connection;

exports.execute = function () {
    connection.connect();
    connection.query(`
    create table if not exists users(
        id int(5) unsigned AUTO_INCREMENT primary key,
        name varchar(30) not null,
        lastname varchar(30) not null,
        email varchar(30) not null unique,
        password text not null,
        created_at timestamp not null
    )`,
        (error, results, fields) => {
            if (error) throw error;
            console.log("users table ok.");
        }
    );
}