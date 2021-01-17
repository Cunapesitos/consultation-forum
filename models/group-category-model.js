'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class GroupCategoryModel {

    createFromAGroup = async (group_id, category_id) => {
        return new Promise(async (resolve, reject) => {
            connection.query(`
                INSERT INTO \`groups_categories\` (\`group_id\`, \`category_id\`) 
                VALUES ('${group_id}', '${category_id}');
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

}

module.exports = GroupCategoryModel;