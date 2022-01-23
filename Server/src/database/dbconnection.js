const mysql = require('mysql');
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "Smart_Key",
    password: "DB Password",
    port: 3306
});

module.exports = connection;