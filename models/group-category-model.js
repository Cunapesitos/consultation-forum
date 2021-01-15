'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class GroupCategoryModel {

    createFromAPublication = async (publication_id, category) => {
        return new Promise(async (resolve, reject) => {
            connection.query(`
                INSERT INTO \`groups_categories\` (\`group_id\`, \`category_id\`) 
                VALUES ('${publication_id}', '${category.id}');
            `, (error, results, fields) => {
                if (error) {
                    console.log("Group category error.");
                    reject(error);
                }
                console.log("----------------------------------GROUP CATEGORY CREATED----------------------------");
                console.log(results);
                resolve(results);
            });
        });
    }

    getFromPublicationId = async (publicationId) => {
        return new Promise(async (resolve, reject) => {
            var query = connection.query(
                'select categories.* from publications_categories, categories where publication_id = ? and category_id = categories.id', publicationId,
                (error, results, fields) => {
                    if (error) {
                        console.log("Publication category error.");
                        reject(error);
                    }
                    console.log("Publications categories found.");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
                    //console.log('results');
                    console.log(results);
                    resolve(results);
                });
        });
    }

}

module.exports = GroupCategoryModel;