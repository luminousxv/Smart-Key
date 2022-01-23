# Server

## 개요

mysql, express, body-parser, crpyto library, express-session, session-file-store, nodemailer, bcrypt 이용

localhost기반으로 테스트를 진행하였고,  request는 Postman 활용

router 모듈화를 해서 유지 보수 및 수정이 편리하게 했다. (1.21 수정)

회원가입 할 시 가입 할 이메일로 인증 번호를 받아 회원가입이 완료되게 하였다. (1.22 수정)

## DB Connection

```jsx
const mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "Smart_Key",
    password: "DB 비밀번호",
    port: 3306
});

module.exports = connection;
```

## Join API

json 파일 형태는

```jsx
{
    "userEmail": "drgvyhn@gmail.com",
    "userPwd": "123456789",
    "userName": "이창현",
    "userBirth": "1997.02.06"
}
```

형태로 테스트 진행해봤다. (Back-End 쪽 테스트이니 바뀔 수 있다)

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const session = require("express-session");
const FileStore = require('session-file-store') (session);
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const app = express();

//Email Configuration
const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    port: 465,
    secure: true,
    auth : {
        user: "gmail id",
        pass: "gmail password"
    }
});

//Session Configuration
router.use(session ({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    stroe: new FileStore()
}));

// Join API

router.post('/user/email-verification', function (req, res) {
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;
    var userBirth = req.body.userBirth;

    var resultCode;
    var message;

    //Repetition Check SQL Query
    var sql2 = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql2, userEmail, function(err, result){
        if(err) {
            resultCode = 404;
            message = '에러가 발생했습니다.';
            console.log(err);
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }

        //Form Check
        else if(formSearch(userPwd, userName, userEmail, userBirth)) {
            resultCode = 400;
            message = '이메일/이름/비밀번호의 양식이 틀렸습니다. 다시 입력해주세요!';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }

        //Sending Verification Email
        else if(result.length === 0) {
            //Encryption: using salt as a key to encrypt the password
            const salt = crypto.randomBytes(32).toString('base64');
            const hashedPw = crypto.pbkdf2Sync(userPwd, salt, 1, 32, 'sha512').toString('base64');

            //Verification Number
            let authNum = Math.random().toString().substr(2, 6);
            
            //Define 'user' session
            req.session.user = {
                Email: userEmail,
                Password: hashedPw,
                Name: userName,
                Birthday: userBirth,
                Salt: salt,
                Auth: authNum
            };

            //Email
            const mailOptions = {
                from: "Smart_Key_KPU <noreply.gmail_id>",
                to: req.session.user.Email,
                subject: "Smart Key 회원가입 인증 번호 메일입니다.",
                text: "인증번호는 " + authNum + " 입니다."
            };

            //Send Email
            smtpTransport.sendMail(mailOptions, (err, res) => {
                if(err) {
                    console.log(err);
                } else{
                    console.log('success');
                }
            })

            resultCode = 200;
            message = req.session.user.Email + ' 로 인증 이메일을 보냈습니다. 확인해주세요!';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        } 

        //Account Exists
        else if (userEmail === result[0].UserEmail) {
            resultCode = 400;
            message = '존재하는 회원입니다.';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }
    });
});

//After verification
router.post('/user/join_success', function (req, res) {
    var inputAuth = req.body.inputAuth;

    //compare with input and session's verification number
    if (inputAuth !== req.session.user.Auth) {
        var resultCode = 400;
        var message = '인증번호가 틀렸습니다. 재인증 부탁드립니다.';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
        req.session.destroy(function(err){
            if (err) throw err;
        });
    } else{
        //DB Write Query
        var sql = 'INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)';
        var params = [req.session.user.Email, req.session.user.Password, req.session.user.Name, req.session.user.Birthday, req.session.user.Salt];
        
        connection.query(sql, params, function(err2, result2) {
            if (err2) {
                console.log(err);
                var resultCode = 404;
                var message = '에러가 발생했습니다.';
            } else{
                resultCode = 200;
                message = '회원가입에 성공했습니다.';
            }
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
            //delete session
            req.session.destroy(function(err){
                if (err) throw err;
            });
        });
    }
})

//Form Checking function
function formSearch(pw, name, email, birth) {
    if (pw.length < 8 || email.length < 8 || name.length < 2|| birth.length !== 10) {
        return true;
    } else {
        return false;
    }
}

app.use('/', router);
module.exports = router;
```

비밀번호는 salt값을 이용해 단방향 암호화를 했다. 회원가입 하면, 그 때 사용한 salt값을 DB에 저장 후, 로그인 할 때 client측에서 입력한 비밀번호에 동일한  salt값을 적용해 hashing을 한 후 비교를 하는 방법이다.

비밀번호를 암호화 후, 클라이언트 측이 입력한 이메일 주소로 인증 번호 이메일을 보내 그 값을 다시 입력해 보내게 했다. nodemailer를 사용했고, 보내는 동안은 session을 활용해서 유지되게 하였다.

위의 JSON파일 형태로 서버로 보내지면 서버측은 다음과 같은 응답을 한다.

```jsx
{
    "code": 200,
    "message": "drgvyhn@gmail.com 로 인증 이메일을 보냈습니다. 확인해주세요!"
}
```

위 이메일에는 이런 형태로 이메일이 와있다.

<aside>
💡 from: Smart_Key_KPU <noreply.gmail.com>

💡 to: drgvyhn@gmail.com

💡 subject: Smart Key 회원가입 인증 번호 메일입니다.

💡 text: 인증번호는 000000 입니다.
</aside>

이 인증번호를 가지고 클라이언트 측에서는 /Smart-Key/user/join_success/ 로 리퀘스트 한다. 리퀘스트 바디로는 인증번호를 보내 서버측에서 가지고 있는 인증번호와 일치하면 db에다가 기록을 하게 한다.

## Login API

위에서 설명 했듯이 client측에서 보내온 userPwd값을 그 계정 instance의 salt값으로 hashing 후 비교를 한다.

Client가 보내는 JSON파일 양식은

```jsx
{
    "userEmail": "drgvyhn@gmail.com",
    "userPwd": "123456789"
}
```

이런 형태로 보낸다. (Back-End 테스트 용으로 바뀔수 있다)

```jsx
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
            resultCode = 204;
            message = '존재하지 않는 계정입니다.';
        }
        else{
            //hash input password to compare with password in DB
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

module.exports = router;
```

위 JSON 파일 형식으로 서버로 보내면 다음과 같은 응답을 client에게 보낸다.

```jsx
{
    "code": 200,
    "message": "로그인 성공! 이창현님 환영합니다!"
}
```

## app.js

실제로 구동되는 서버 프로그램은 다음과 같다.

```jsx
var express  = require('express');
var app = express();

var joinRouter = require('./routes/join');
app.use('/Smart-Key', joinRouter);

var loginRouter = require('./routes/login');
app.use('/Smart-Key', loginRouter);

//Server
var server = app.listen(8080,'localhost', function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})
```