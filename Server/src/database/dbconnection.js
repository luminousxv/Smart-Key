const mysql = require('mysql');
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "Smart_Key",
    password: "DB 비밀번호",
    port: 3306
});

module.exports = connection;