'use strict'

var bcrypt = require('bcrypt');
var moment = require('moment');
var connection = require('../db/connection').Connection;

class UserModel {

    create = async (data) => {
        return new Promise(async (resolve, reject) => {
            let salt = +process.env.APP_SECRET_SALT_OR_ROUNDS_COUNT;
            const hash = await bcrypt.hash(data.password, salt);
            data.password = hash;
            data.created_at = moment().format();
            delete data.password_confirmation;
            console.log("Inserting user...");
            console.log(data);
            var query = connection.query('insert into users set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("User created.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    resolve(data);
                });
        });
    }

    getUserByEmail = async (email) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query('select * from users where email = ?', email,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("User found.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    console.log('results');
                    console.log(results[0]);
                    if (results[0])
                        delete results[0].password;
                    resolve(results[0]);
                });
        });
    }

    isCorrectPassword = async (password, userId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query('select * from users where id = ?', userId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("User found.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    console.log('results');
                    console.log(results[0]);
                    let user = results[0];
                    console.log(user.password);
                    bcrypt.compare(password, user.password, (error, same) => {
                        if (error) {
                            console.log("Error decrypting.");
                            reject(error);
                        }
                        resolve(same);
                    });
                });
        });
    }


    update = () => {
        // connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
        //     if (error) throw error;
        //     // ...
        //   });
    }

    //     var sorter = 'date';
    // var sql    = 'SELECT * FROM posts ORDER BY ' + connection.escapeId(sorter);
    // connection.query(sql, function (error, results, fields) {
    //   if (error) throw error;
    //   // ...
    // });
}

module.exports = UserModel;