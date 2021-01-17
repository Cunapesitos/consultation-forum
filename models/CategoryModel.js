'use strict'

var moment = require('moment');
var connection = require('../db/Connection').Connection;

class CategoryModel {

    search = async (word) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`select * from categories where name LIKE '%${word}%' limit 10;`,
                (error, results, fields) => {
                    if (error) {
                        console.log("Category error.");
                        reject(error);
                    }
                    console.log("Categories found.");
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

    getFromGroupId = async (groupId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`
                select categories.* from groups_categories, categories
                where group_id = ? 
                    and categories.id = groups_categories.category_id`, groupId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group category error.");
                        reject(error);
                    }
                    console.log("Groups categories found.");
                    console.log(results);
                    resolve(results);
                });
        });
    }

    getFromPublicationId = async (publicationId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(`
                select categories.* from categories, publications
                where publications.id = ? 
                    and categories.id = publications.category_id`, publicationId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Group category error.");
                        reject(error);
                    }
                    console.log("Groups categories found.");
                    console.log(results[0]);
                    resolve(results[0]);
                });
        });
    }

}

module.exports = CategoryModel;