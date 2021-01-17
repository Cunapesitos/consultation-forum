'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class PublicationModel {

    create = async (data) => {
        return new Promise(async (resolve, reject) => {
            data.created_at = moment().format();
            var query = connection.query('insert into publications set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("Publication error.");
                        reject(error);
                    }
                    console.log("----------------------------------PUBLICATION CREATED----------------------------");
                    console.log(results[0]);
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
                        console.log("Publication error.");
                        reject(error);
                    }
                    console.log("Publications found.");
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

    getFromId = async (id) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select publications.*, categories.name from publications, categories where publications.id = ? and category_id = categories.id', id,
                (error, results, fields) => {
                    if (error) {
                        console.log("Publication error.");
                        reject(error);
                    }
                    console.log("Publications found.");
                    console.log(results[0]);
                    if (results[0])
                        results[0].created_at = moment(results[0].created_at).locale('en').format('LLLL');
                    resolve(results[0]);
                });
        });
    }

    getFromGroupId = async (groupId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`
                select publications.*, users.* from publications, users, grops
                where grops.id = ? and publications.group_id=grops.id and publications.user_id = users.id `, groupId,
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

}

module.exports = PublicationModel;