'use strict'

var connection = require('./connection').Connection;
var moment = require('moment');

exports.execute = function () {
    // users
    connection.query(`
    create table if not exists users(
        id int(5) unsigned AUTO_INCREMENT primary key,
        name varchar(30) not null,
        lastname varchar(30) not null,
        email varchar(30) not null unique,
        password text not null,
        access_token text,
        created_at timestamp not null
    )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table users ok.");
        }
    );

    // categories
    let date = moment().format();
    connection.query(`
        create table if not exists categories(
            id int(5) unsigned AUTO_INCREMENT primary key,
            name varchar(30) not null,
            created_at timestamp
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table categories ok.");
        }
    );

    // publications
    connection.query(`
        create table if not exists publications(
            id int(5) unsigned AUTO_INCREMENT primary key,
            title varchar(50) not null,
            content text not null,
            created_at timestamp not null,
            user_id int(5) unsigned not null,
            category_id int(5) unsigned not null,
            foreign key (category_id) references categories(id) on delete cascade 
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table publications ok.");
        }
    );

    // comments
    connection.query(`
    create table if not exists comments(
        id int(5) unsigned AUTO_INCREMENT primary key,
        content text not null,
        created_at timestamp not null,
        user_id int(5) unsigned not null,
        publication_id int(5) unsigned not null,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (publication_id) references publications(id) on delete cascade 
    )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table comments ok.");
        }
    );
    
    connection.query(`
        INSERT IGNORE INTO \`categories\` (\`id\`, \`name\`, \`created_at\`) 
        VALUES 
        ('1', 'Base de datos', current_timestamp()),
        ('2', 'Java', current_timestamp()),
        ('3', 'Calculo 1', current_timestamp());
    `,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("Categories seeded.");
        }
    );

}