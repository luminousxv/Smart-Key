const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require('session-file-store') (session);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session ({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie:{maxAge: 900000} //15minutes
}));

//Login API
router.post('/user/login', function(req, res) {
    let userEmail = req.body.userEmail;
    let userPwd = req.body.userPwd;
    //Check if account exists
    let sql = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql, userEmail, function(err, result) {
        console.log(req.body);
        let resultCode = 404;
        let message = '에러가 발생했습니다.';
        
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
                req.session.login = {
                    Email : userEmail,
                    Name : result[0].UserName
                }
                resultCode = 200;
                message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
            }
        }

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    })
});

module.exports = router;