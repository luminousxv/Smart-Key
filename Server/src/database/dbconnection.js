const mysql = require('mysql');
//Database configuration
const connection = mysql.createPool({
    host: "localhost",
    user: "Smart-Key",
    database: "SMART_KEY",
    password: "1234",
    port: 3306
});

module.exports = connection;