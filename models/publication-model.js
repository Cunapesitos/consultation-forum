'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class PublicationModel {

    create = async (data) => {
        return new Promise(async (resolve, reject) => {
            data.created_at = moment().format();
            console.log("Inserting user...");
            console.log(data);
            var query = connection.query('insert into publications set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("Publication created.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    console.log("Query results");
                    console.log(results);
                    data.id = results.insertId;
                    resolve(data);
                });
        });
    }

    getFromUserId = async (userId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select publications.*, users.name, users.lastname from publications, users where user_id = ? and users.id = user_id', userId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("Publications found.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    console.log('results');
                    console.log(results);
                    Object.keys(results).map(function (key, indexA) {
                        Object.keys(results[indexA]).map(function (key, index) {
                            console.log(key);
                            if (key == 'created_at') {
                                results[indexA][key] = moment(results[indexA][key]).locale('en').format('LLLL');
                                console.log("THIS IS CHANGED");
                                console.log(results[indexA][key]);
                            }
                        });
                    });
                    resolve(results);
                });
        });
    }

    getFromId = async (id) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select * from publications where id = ? ', id,
                (error, results, fields) => {
                    if (error) {
                        console.log("Here is the error.");
                        reject(error);
                    }
                    console.log("Publications found.");
                    console.log("SQL executed:");
                    console.log(query.sql);
                    console.log('results');
                    console.log(results);
                    if (results[0])
                        results[0].created_at = moment(results[0].created_at).locale('en').format('LLLL');
                    resolve(results[0]);
                });
        });
    }

}

module.exports = PublicationModel;