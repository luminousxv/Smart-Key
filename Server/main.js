var mysql = require('mysql');
var express  = require('express');
var bodyParser = require('body-parser');
var app = express();
const crypto = require('crypto');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// DB Connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "Smart_Key",
    password: "DB 비밀번호",
    port: 3306
});

// Join API
app.post('/user/join', function (req, res) {
    console.log(req.body);
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;
    var userBirth = req.body.userBirth;

    //Repetition Check SQL Query
    var sql2 = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql2, userEmail, function(err, result){
        var resultCode = 404;
        var message = '에러가 발생했습니다.';
        if(err) {
            console.log(err);
            res.json({
                'code': resultCode,
                'message': message
            });
        }

        //Form Check
        else if(blackSearch(userPwd, userName, userEmail, userBirth)) {
            resultCode = 203;
            message = '이메일/이름/비밀번호의 양식이 틀렸습니다. 다시 입력해주세요!';
            res.json({
                'code': resultCode,
                'message': message
            });
        }

        //DB Write
        else if(result.length === 0) {
            //Encryption: using salt as a key to encrypt the password
            const salt = crypto.randomBytes(32).toString('base64');
            const hashedPw = crypto.pbkdf2Sync(userPwd, salt, 1, 32, 'sha512').toString('base64');
            
            //DB Write Query
            var sql = 'INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)';
            var params = [userEmail, hashedPw, userName, userBirth, salt];
            
            connection.query(sql, params, function(err2, result2) {
                if (err2) {
                    console.log(err);
                    var resultCode = 404;
                    var message = '에러가 발생했습니다.';
                } else{
                    resultCode = 200;
                    message = '회원가입에 성공했습니다.';
                }
                res.json({
                    'code': resultCode,
                    'message': message
                });
            });
        } 

        //Account Exists
        else if (userEmail === result[0].UserEmail) {
            resultCode = 203;
            message = '존재하는 회원입니다.';
            res.json({
                'code': resultCode,
                'message': message
            });
        }
    });
});

//Login API
app.post('/user/login', function(req, res) {
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    //Check if account exists
    var sql = 'select * from Users where UserEmail = ?';

    connection.query(sql, userEmail, function(err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다.';
        
        if (err) {
            console.log(err);
        }
        else if(result.length === 0) {
            resultCode = 204;
            message = '존재하지 않는 계정입니다.';
        }
        else{
            //encrypt input password to compare with password in DB
            const hashedPw2 = crypto.pbkdf2Sync(userPwd, result[0].Salt, 1, 32, 'sha512').toString('base64');

            if (result[0].UserPwd !== hashedPw2) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                resultCode = 200;
                message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
            }
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    })
});

//Server
var server = app.listen(8080,'localhost', function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})

//Form Checking function
function blackSearch(pw, name, email, birth) {
    if (pw.length < 8 || email.length < 5 || name.length < 2|| birth.length !== 10) {
        return true;
    } else {
        return false;
    }
}