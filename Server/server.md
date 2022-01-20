# Server
## 개요

mysql, express, body-parser, crpyto library 이용

localhost기반으로 테스트를 진행하였고,  request는 Postman 활용

```jsx
var mysql = require('mysql');
var express  = require('express');
var bodyParser = require('body-parser');
var app = express();
const crypto = require('crypto');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
```

## DB Connection

```jsx
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "Smart_Key",
    password: "Chrislee97!@",
    port: 3306
});
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
//Join API
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

//Form Checking function
function blackSearch(pw, name, email, birth) {
    if (pw.length < 8 || email.length < 5 || name.length < 2|| birth.length !== 10) {
        return true;
    } else {
        return false;
    }
}
```

비밀번호는 salt값을 이용해 단방향 암호화를 했다. 회원가입 하면, 그 때 사용한 salt값을 DB에 저장 후, 로그인 할 때 client측에서 입력한 비밀번호에 동일한  salt값을 적용해 hashing을 한 후 비교를 하는 방법이다.

위의 JSON파일 형태로 서버로 보내지면 서버측은 다음과 같은 응답을 한다.

```jsx
{
    "code": 200,
    "message": "회원가입에 성공했습니다."
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
```

위 JSON 파일 형식으로 서버로 보내면 다음과 같은 응답을 client에게 보낸다.

```jsx
{
    "code": 200,
    "message": "로그인 성공! 이창현님 환영합니다!"
}
```
server는 다음과 같이 했다. 

```jsx
//Server
var server = app.listen(8080,'localhost', function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})
```

로컬호스트에 있는 client(Postman)으로 연결하였고, 포트는 8080을 사용하였다.