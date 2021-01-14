'use strict'

var moment = require('moment');
var connection = require('../db/connection').Connection;

class PublicationCategoryModel {

    createFromAPublication = async (publication_id, categories) => {
        return new Promise(async (resolve, reject) => {
            let query = `
                INSERT INTO \`publications_categories\` (\`publication_id\`, \`category_id\`) 
                VALUES ('${publication_id}', '${categories[0].id}')
            `;
            let aux = false;
            categories.forEach(element => {
                if(aux){
                    query += `,
                    ('${publication_id}', '${element.id}')
                    `;
                    aux = true
                }
            });
            query += ";";
            connection.query(query,
                (error, results, fields) => {
                    if (error) {
                        console.log("Publication category error.");
                        reject(error);
                    }
                    console.log("----------------------------------PUBLICATION CATEGORY CREATED----------------------------");
                    //console.log("SQL executed:");
                    //console.log(query.sql);
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

module.exports = PublicationCategoryModel;