const mysql = require('mysql');
//Database configuration
const connection = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    database: "Smart_Key",
    password: "q1w2e3r4!@",
    port: 3306
});

module.exports = connection;