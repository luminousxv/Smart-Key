const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require('session-file-store') (session);
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session ({
    secret: 'loginsuccess',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie:{maxAge: 900000} //15minutes
}));

//Login API
router.post('/user/login', function(req, res) {
    let base64_Email = req.body.userEmail;
    let base64_Pwd = req.body.userPwd;
    let UserEmail = Buffer.from(base64_Email, 'base64').toString('utf-8');
    let UserPwd = Buffer.from(base64_Pwd, 'base64').toString('utf-8');

    console.log('---입력값---');
    console.log('BASE64 Encoded 이메일: '+ base64_Email);
    console.log('BASE64 Encoded 비밀번호: '+ base64_Pwd);
    console.log('이메일: '+ UserEmail);
    console.log('비밀번호: '+ UserPwd);
    console.log('----------');

    //Check if account exists
    let sql = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql, UserEmail, function(err, result) {
        let resultCode = 404;
        let message = '에러가 발생했습니다.';
        
        if (err) {
            console.log('select error from Users table');
            console.log(err);
        }
        else if(result.length === 0) {
            resultCode = 400;
            message = '존재하지 않는 계정입니다.';
        }
        else{
            //encrypt input password to compare with password in DB
            const hashedPw2 = crypto.pbkdf2Sync(UserPwd, result[0].Salt, 1, 32, 'sha512').toString('base64');

            if (result[0].UserPwd !== hashedPw2) {
                resultCode = 401;
                message = '비밀번호가 틀렸습니다!';
            } else {
                req.session.login = {
                    Email : UserEmail,
                    Name : result[0].UserName
                }
                
                resultCode = 200;
                message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
                console.log('----login 세션----');
                console.log('세션 아이디: ' + req.sessionID);
                console.log(req.session.login);
                console.log('------------');
            }
        }
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    })
});

module.exports = router;