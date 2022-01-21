const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Join API
router.post('/user/join', function (req, res) {
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
        else if(formSearch(userPwd, userName, userEmail, userBirth)) {
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

//Form Checking function
function formSearch(pw, name, email, birth) {
    if (pw.length < 8 || email.length < 5 || name.length < 2|| birth.length !== 10) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;
