'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class GroupModel {

    search = async (word) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`select * from grops where name LIKE '%${word}%' limit 10;`,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group error.");
                        reject(error);
                    }
                    console.log("Groups found.");
                    console.log(results);
                    resolve(results);
                });
        });
    }

    create = async (data) => {
        return new Promise(async (resolve, reject) => {
            data.created_at = moment().format();
            connection.query('insert into grops set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group error.");
                        reject(error);
                    }
                    console.log("----------------------------------GROUP CREATED----------------------------");
                    console.log(results);
                    data.created_at = moment(data.created_at).locale('en').format('LLLL');
                    data.id = results.insertId;
                    resolve(data);
                });
        });
    }

    getFromId = async (id) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select * from grops where id = ? ', id,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group error.");
                        reject(error);
                    }
                    console.log("Group found.");
                    console.log(results[0]);
                    results[0].created_at = moment(results[0].created_at).locale('en').format('LLLL');
                    resolve(results[0]);
                });
        });
    }

    getFromUserId = async (id) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select * from grops where user_id = ? ', id,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group error.");
                        reject(error);
                    }
                    console.log("Group found.");
                    console.log(results);
                    Object.keys(results).map(function (key, indexA) {
                        Object.keys(results[indexA]).map(function (key, index) {
                            if (key == 'created_at') {
                                results[indexA][key] = moment(results[indexA][key]).locale('en').format('LLLL');
                            }
                        });
                    });
                    resolve(results);
                });
        });
    }

}

module.exports = GroupModel;