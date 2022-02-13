# Login/Join/ResetPW API 및 app.js(main server program)

## 개요

mysql, express, body-parser, crpyto library, express-session, session-file-store, nodemailer, bcrypt 이용

localhost기반으로 테스트를 진행하였고,  request는 Postman 활용

router 모듈화를 해서 유지 보수 및 수정이 편리하게 했다. (1.21 수정)

회원가입 할 시 가입 할 이메일로 인증 번호를 받아 회원가입이 완료되게 하였다. (1.22 수정)

비밀번호 초기화를 구현했다. (1.23 수정)

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
let bodyParser = require("body-parser");
const http = require('http');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const app = express();

//Email Configuration
const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    port: 465,
    secure: true,
    auth : {
        user: "drgvyhn@gmail.com",
        pass: "google_pw"
    }
});

//Session Configuration
router.use(session ({
    secret: 'joinsuccess',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie:{maxAge: 900000} //15minutes
}));

// Join API

router.post('/user/join/email-verification', function (req, res) {
    let userEmail = req.body.userEmail;
    let userPwd = req.body.userPwd;
    let userName = req.body.userName;
    let userBirth = req.body.userBirth;
    console.log('입력값: ' + userEmail + ' '+userPwd + ' ' + userName + ' ' + userBirth);

    let resultCode;
    let message;

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
                from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
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
            });

            resultCode = 200;
            message = req.session.user.Email + ' 로 인증 이메일을 보냈습니다. 확인해주세요!';
            console.log('세션 아이디: ' + req.sessionID);
            console.log('----user 세션----');
            console.log(req.session.user);
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
router.post('/user/join/join_success', function (req, res) {
    let inputAuth = req.body.inputAuth;
    console.log('입력값:' + inputAuth);
    console.log('세션 아이디: ' + req.sessionID);
    console.log('----user 세션----');
    console.log(req.session.user);

    if (req.session.user === undefined) {
        let resultCode = 404;
        let message = '인증번호가 만료 되었습니다. 처음부터 다시 해주세요.';

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    //compare with input and session's verification number
    else if (inputAuth !== req.session.user.Auth) {
        let resultCode = 400;
        let message = '인증번호가 틀렸습니다. 다시 입력 해주세요.';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    } else{
        //DB Write Query
        let sql = 'INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)';
        let params = [req.session.user.Email, req.session.user.Password, req.session.user.Name, req.session.user.Birthday, req.session.user.Salt];
        
        connection.query(sql, params, function(err2, result2) {
            if (err2) {
                console.log(err);
                let resultCode = 404;
                let message = '에러가 발생했습니다.';
            } else{
                resultCode = 200;
                message = '회원가입에 성공했습니다.';
            }
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
            //delete session
            req.session.destroy(function () {
                req.session;
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

클라이언트 측에서는 이메일, 비밀번호, 이름, 생년월일을 /Smart-Key/user/email-verification/ 으로 리퀘스트을 하면 서버 측에서는 이메일과 비밀번호, 이름을 확인 뒤 회원가입이 가능하면 리스폰스를 보낸다.

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
to: drgvyhn@gmail.com
subject: Smart Key 회원가입 인증 번호 메일입니다.
text: 인증번호는 000000 입니다.

</aside>

이 인증번호를 가지고 클라이언트 측에서는 /Smart-Key/user/join_success/ 로 리퀘스트 한다. 리퀘스트 바디로는 인증번호를 보내 서버측에서 가지고 있는 인증번호와 일치하면 db에다가 기록을 하게 한다. 다음과 같이 클라이언트는 서버에게 리퀘스트를 한다.

```jsx
{
    "inputAuth" : "000000"
}
```

서버에서는 DB에 정보들이 갱신되고 완료가 되면 다음과 같이 리스폰스를 해준다.

```jsx
{
    "code": 200,
    "message": "회원가입에 성공했습니다!"
}
```

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
const session = require("express-session");
const FileStore = require('session-file-store') (session);

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
    let userEmail = req.body.userEmail;
    let userPwd = req.body.userPwd;

    console.log('입력값: ' + userEmail + ' ' + userPwd);
    //Check if account exists
    let sql = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql, userEmail, function(err, result) {
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
        console.log('세션 아이디: ' + req.sessionID);
        console.log('----login 세션----');
        console.log(req.session.login);
        res.status(resultCode).json({
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

## resetPW API

Salt/Hash를 이용해 단방향 암호화를 해서 original 비밀번호를 찾는건 불가능하다. 그러므로, 비밀번호를 까먹었을 때 다시 초기화를 수행해 새로운 비밀번호를 설정해줘야 한다.

회원가입 시에 했던 이메일인증을 이용해 인증하는 방식으로 했다.

먼저, 비밀번호를 초기화 하고자 하는 계정의 정보를 클라이언트 측에서 리퀘스트 해준다.

```jsx
{
    "userEmail": "drgvyhn@gmail.com",
    "userName": "이창현",
    "userBirth": "1997.02.06"
}
```

서버 측은 리스폰스로 이메일을 보내왔다고 리스폰스를 해준다.

```jsx
{
    "code": 200,
    "message": "이메일 인증을 위해 drgvyhn@gmail.com 으로 이메일을 보냈습니다."
}
```

그럼 이메일에는 이런 형태의 이메일이 와 있다.

<aside>
💡 from: Smart_Key_KPU <noreply.gmail.com>
to: drgvyhn@gmail.com
subject: Smart Key 비밀번호 초기화 인증 번호 메일입니다.
text: 인증번호는 000000 입니다.

</aside>

위 인증번호로 클라이언트 측은 리퀘스트를 다시 해준다.

```jsx
{
    "inputAuth": "523790"
}
```

인증번호가 맞으면 서버 측에서는 다음과 같은 리스폰스를 해준다.

```jsx
{
    "code": 200,
    "message": "이메일 인증이 완료되었습니다."
}
```

클라이언트 측에서는 이제 사용자에게 새로운 비밀번호를 입력 받고 서버측으로 리퀘스트 해준다.

```jsx
{
    "userPwd": "987654321"
}
```

회원가입시 Salt값을 적용해 hashing해주는 과정을 거치면 UPDATE SQL 쿼리를 사용해 db 정보를 갱신한다. 그 후, 서버측의 리스폰스는 다음과 같다.

```jsx
{
    "code": 200,
    "message": "비밀번호 변경에 성공하셨습니다."
}
```

다음은 resetPW API의 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require('session-file-store') (session);
const nodemailer = require("nodemailer");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session ({
    secret: 'passwordreset',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie:{maxAge: 900000} //2minutes
}));

const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    port: 465,
    secure: true,
    auth : {
        user: "drgvyhn@gmail.com",
        pass: "google_pw"
    }
});

router.post('/user/reset/email', function(req, res) {
    let userEmail = req.body.userEmail;
    let userName = req.body.userName;
    let userBirth = req.body.userBirth;

    console.log('입력값: ' + userEmail + ' ' + userName + ' ' + userBirth);

    let sql1 = 'select * from Users where UserEmail = ? and UserName = ? and UserBirth = ?';
    let params = [userEmail, userName, userBirth];

    connection.query(sql1, params, function(err, result) {
        if (err) {
            let resultCode = 404;
            let message = '에러가 발생했습니다.';
            console.log(err);

            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }

        else if (result.length ===0) {
            let resultCode = 400;
            let message = '존재하지 않는 회원정보입니다. 다시 입력해주세요.';

            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }

        else{
            let resultCode = 200;
            let message = '이메일 인증을 위해 ' + result[0].UserEmail + ' 으로 이메일을 보냈습니다.';
            
            let authNum = Math.random().toString().substr(2, 6);

            req.session.reset = {
                Email: userEmail,
                Auth: authNum
            };

            const mailOptions = {
                from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
                to: req.session.reset.Email,
                subject: "Smart Key 비밀번호 초기화 인증 번호 메일입니다.",
                text: "인증번호는 " + authNum + " 입니다."
            };

            smtpTransport.sendMail(mailOptions, (err, res) => {
                if(err) {
                    console.log(err);
                } else{
                    console.log('success');
                }
            });
            console.log('세션 아이디: ' + req.sessionID);
            console.log('----reset 세션----');
            console.log(req.session.reset);
            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }
    })
})

router.post('/user/reset/verification', function (req, res) {
    let inputAuth = req.body.inputAuth;
    console.log('입력값: ' + inputAuth);
    console.log('----reset 세션----');
    console.log(req.session.reset);

    if (req.session.reset === undefined) {
        let resultCode = 404;
        let message = '인증번호가 만료 되었습니다. 처음부터 다시 해주세요.';

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else if (inputAuth !== req.session.reset.Auth) {
        let resultCode = 400;
        let message = '인증번호가 틀렸습니다. 다시 입력해 주세요.';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else{
        let resultCode = 200;
        let message = '이메일 인증이 완료되었습니다.';

        req.session.reset.auth = '';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }
})

router.post('/user/reset/change_pw', function (req, res) {
    let userPwd = req.body.userPwd;
    console.log('입력값: ' + userPwd);

    if (formSearch(userPwd)) {
        let resultCode = 400;
        let message = '비밀번호는 9자리 이상이어야 합니다. 다시 입력해주세요.';

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else {
        //Encryption: using salt as a key to encrypt the password
        const salt = crypto.randomBytes(32).toString('base64');
        const hashedPw = crypto.pbkdf2Sync(userPwd, salt, 1, 32, 'sha512').toString('base64');

        let sql2 = 'update Users set UserPwd = ?, Salt = ? where UserEmail = ?';

        connection.query(sql2, [hashedPw, salt, req.session.reset.Email], function (err, result){
            if (err) {
                let resultCode = 404;
                let message = '에러가 발생했습니다.'
                console.log(err);

                res.status(resultCode).json({
                    'code': resultCode,
                    'message': message
                });
            }
            else{
                let resultCode = 200;
                let message = '비밀번호 변경에 성공하셨습니다.';

                res.status(resultCode).json({
                    'code': resultCode,
                    'message': message
                });
                req.session.destroy();
            }
        });
    }
})

//Form Checking function
function formSearch(pw, name, email, birth) {
    if (pw.length < 8) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;
```

세션을 이용해 비밀번호를 바꿀 사용자의 이메일 계정과 인증번호를 가지고 있게 한다.

## app.js

실제로 구동되는 서버 프로그램은 다음과 같다.

```jsx
const express  = require('express');
const app = express();

let joinRouter = require('./routes/join');
app.use('/Smart-Key', joinRouter);

let loginRouter = require('./routes/login');
app.use('/Smart-Key', loginRouter);

let resetPwRouter = require('./routes/resetPW');
app.use('/Smart-Key', resetPwRouter);

let keylistRouter = require('./routes/keylist');
app.use('/Smart-Key', keylistRouter);

let registerkeyRouter = require('./routes/register_key');
app.use('/Smart-Key', registerkeyRouter);

let deletekeyRouter = require('./routes/delete_key');
app.use('/Smart-Key', deletekeyRouter);

let keyrecordRouter = require('./routes/keyrecord');
app.use('/Smart-Key', keyrecordRouter)

let keycontrolRouter = require('./routes/keycontrol');
app.use('/Smart-Key', keycontrolRouter);

let keyPwdRouter = require('./routes/keyPW');
app.use('/Smart-Key', keyPwdRouter);

let rpiRouter = require('./routes/rpi_control');
app.use('/Smart-Key', rpiRouter);

//Server
let server = app.listen(8080,'localhost', function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})
```