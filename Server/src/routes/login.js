const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Login API
router.post('/user/login', function(req, res) {
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
            resultCode = 400;
            message = '존재하지 않는 계정입니다.';
        }
        else{
            //encrypt input password to compare with password in DB
            const hashedPw2 = crypto.pbkdf2Sync(userPwd, result[0].Salt, 1, 32, 'sha512').toString('base64');

            if (result[0].UserPwd !== hashedPw2) {
                resultCode = 401;
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

module.exports = router;