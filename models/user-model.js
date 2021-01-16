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
            var query = connection.query('insert into users set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("User error.");
                        reject(error);
                    }
                    console.log("----------------------------------USER CREATED----------------------------");
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
                        console.log("User error.");
                        reject(error);
                    }
                    console.log("User found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    // console.log('results');
                    console.log(results[0]);
                    if ((!results))
                        resolve(null);
                    if (results[0])
                        delete results[0].password;
                    resolve(results[0]);
                });
        });
    }

    getUserById = async (id) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query('select * from users where id = ?', id,
                (error, results, fields) => {
                    if (error) {
                        console.log("User error.");
                        reject(error);
                    }
                    console.log("User found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    //console.log('results');
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
                        console.log("User error.");
                        reject(error);
                    }
                    console.log("User found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    //console.log('results');
                    console.log(results[0]);
                    let user = results[0];
                    //console.log(user.password);
                    bcrypt.compare(password, user.password, (error, same) => {
                        if (error) {
                            console.log("Decrypt error.");
                            reject(error);
                        }
                        resolve(same);
                    });
                });
        });
    }

    updateUserById = (userId, newUserData) => {
        return new Promise(async (resolve, reject) => {
            connection.query(`
                UPDATE users SET
                name = ?,
                lastname = ?,
                email = ?,
                access_token = ?
                WHERE id = ?
            `, [
                newUserData.name,
                newUserData.lastname,
                newUserData.email,
                newUserData.access_token,
                newUserData.id
            ], function (error, results, fields) {
                if (error) {
                    console.log("User error.");
                    reject(error);
                }
                var query = connection.query('select * from users where id = ?', newUserData.id,
                    (error, results, fields) => {
                        if (error) {
                            console.log("User error.");
                            reject(error);
                        }
                        console.log("User found.");
                        //console.log("SQL executed:");
                        //console.log(query.sql);
                        //console.log('results');
                        console.log(results[0]);
                        if (results[0])
                            delete results[0].password;
                        resolve(results[0]);
                    });
            });
        });
    }

    search = async (word) => {
        return new Promise(async (resolve, reject) => {
            let aux = "";
            word.split('%20').forEach(element => {
                aux += element + "%";
            });
            console.log(aux);
            var query = connection.query(`select * from users where name LIKE '%${aux}' limit 10;`,
                (error, results, fields) => {
                    if (error) {
                        console.log("User error.");
                        reject(error);
                    }
                    console.log("Users found.");
                    console.log(results);
                    resolve(results);
                });
        });
    }
}

module.exports = UserModel;