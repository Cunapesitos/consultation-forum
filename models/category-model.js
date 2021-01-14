'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class CategoryModel {

    search = async (word) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`select * from categories where name LIKE '%${word}%' limit 10;`,
                (error, results, fields) => {
                    if (error) {
                        console.log("Category error.");
                        reject(error);
                    }
                    console.log("Categorire found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    console.log(results);
                    resolve(results);
                });
        });
    }

    create = async (data) => {
        return new Promise(async (resolve, reject) => {
            data.created_at = moment().format();
            //console.log("Inserting user...");
            //console.log(data);
            var query = connection.query('insert into comments set ?', data,
                (error, results, fields) => {
                    if (error) {
                        console.log("Category error.");
                        reject(error);
                    }
                    console.log("----------------------------------CATEGORY CREATED----------------------------");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    console.log(result[0]);
                    data.created_at = moment(data.created_at).locale('en').format('LLLL');
                    resolve(data);
                });
        });
    }

    getFromPublicationId = async (publicationId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`
                select comments.*, users.* from comments, users, publications publications
                where publications.id = ? 
                    and comments.publication_id = publications.id
                    and users.id = comments.user_id`, publicationId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Category error.");
                        reject(error);
                    }
                    console.log("Categories found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    //console.log('results');
                    console.log(results);
                    Object.keys(results).map(function (key, indexA) {
                        Object.keys(results[indexA]).map(function (key, index) {
                            //console.log(key);
                            if (key == 'created_at') {
                                results[indexA][key] = moment(results[indexA][key]).locale('en').format('LLLL');
                                //console.log("THIS IS CHANGED");
                                //console.log(results[indexA][key]);
                            }
                        });
                    });
                    resolve(results);
                });
        });
    }

}

module.exports = CategoryModel;