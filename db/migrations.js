'use strict'

var connection = require('./connection').Connection;

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
            user_id int(5) unsigned not null
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table publications ok.");
        }
    );

    // publications_categories
    connection.query(`
        create table if not exists publications_categories(
            publication_id int(5) unsigned not null,
            foreign key (publication_id) references publications(id) on delete cascade,
            category_id int(5) unsigned not null,
            foreign key (category_id) references categories(id) on delete cascade,
            primary key (publication_id, category_id)
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table publications_categories ok.");
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

    // category seeder
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

function deleteTable(name) {
    connection.query(`drop table ${name}`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log(`drop table ${name} ok.`);
        }
    );
}

function addColumn(tableName, column){
    connection.query(`ALTER TABLE ${tableName} ADD ${column}`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log(`add column ${column} on table ${tableName} ok.`);
        }
    );
}

function dropColumn(tableName, columnName){
    connection.query(`ALTER TABLE ${tableName}
    DROP COLUMN ${columnName};`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log(`drop column ${columnName} on table ${tableName} ok.`);
        }
    );
}