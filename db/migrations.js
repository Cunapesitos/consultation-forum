'use strict'

var connection = require('./connection').Connection;
var bcrypt = require('bcrypt');
let salt = +process.env.APP_SECRET_SALT_OR_ROUNDS_COUNT;

exports.execute = async function () {

    //addColumn('categories', 'style varchar(15) NOT NULL after name');

    deleteTable('comments');
    deleteTable('groups_categories');
    deleteTable('publications');
    deleteTable('categories');
    deleteTable('groups');
    deleteTable('users');

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
            name varchar(30) not null unique,
            style varchar(15) not null,
            created_at timestamp
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table categories ok.");
        }
    );

    // groups
    connection.query(`
        create table if not exists groups(
            id int(5) unsigned AUTO_INCREMENT primary key,
            name varchar(30) not null,
            created_at timestamp not null,
            user_id int(5) unsigned not null,
            foreign key (user_id) references users(id) on delete cascade
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table groups ok.");
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
            group_id int(5) unsigned,
            foreign key (category_id) references categories(id) on delete cascade,
            foreign key (group_id) references groups(id) on delete cascade
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
        rating int(2) not null,
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

    // groups_categories
    connection.query(`
        create table if not exists groups_categories(
            group_id int(5) unsigned not null,
            foreign key (group_id) references groups(id) on delete cascade,
            category_id int(5) unsigned not null,
            foreign key (category_id) references categories(id) on delete cascade,
            primary key (group_id, category_id)
        )`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("table groups_categories ok.");
        }
    );

    // category seeder
    const hash = await bcrypt.hash(process.env.APP_SECRET_PASSWORD, salt);
    connection.query(`
        INSERT IGNORE INTO \`users\` (\`id\`, \`name\`, \`lastname\`, \`email\`, \`password\`, \`access_token\`, \`created_at\`) 
        VALUES 
        ('1', 'Jorge Rodrigo', 'Torrez Aramayo', 'jorgerodrigotorrez@gmail.com', '${hash}',null, current_timestamp());
    `,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log("Users seeded.");
        }
    );

    // category seeder
    connection.query(`
        INSERT IGNORE INTO \`categories\` (\`id\`, \`name\`, \`style\`, \`created_at\`) 
        VALUES 
        ('1', 'Base de datos', 'success', current_timestamp()),
        ('2', 'Java', 'warning', current_timestamp()),
        ('3', 'Calculo 1', 'info', current_timestamp()),
        ('4', 'Calculo 2', 'dark', current_timestamp()),
        ('5', 'Programacion 1', 'white', current_timestamp()),
        ('6', 'Programacion 2', 'secondary', current_timestamp()),
        ('7', 'Algebra lineal', 'danger', current_timestamp()),
        ('8', 'Ingles 1', 'danger', current_timestamp());
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

function addColumn(tableName, column) {
    connection.query(`ALTER TABLE ${tableName} ADD ${column}`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log(`add column ${column} on table ${tableName} ok.`);
        }
    );
}

function dropColumn(tableName, columnName) {
    connection.query(`ALTER TABLE ${tableName}
    DROP COLUMN ${columnName};`,
        (error, results, fields) => {
            if (error) return console.log(error.message);
            console.log(`drop column ${columnName} on table ${tableName} ok.`);
        }
    );
}