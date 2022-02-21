# KEYLIST/REGISTER_KEY/DELETE_KEY/KEYRECORD API

## 개요

DB에서 KeyInfo라는 테이블을 이용해 테이블을 등록, 조회, 삭제를 하는  API들이다.

로그인 세션을 만들어 15분동안 조작이 가능하게 했다. 

## keylist API

사용자의 키 리스트를 DB에서 가져와 주는 API이다. 사용자의 로그인 세션이 만료가 안되었다면 DB에서 가져와서 리스폰스를 보내주는 방식이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/main/view_keylist', function (req, res) {
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    
    else{
        let sql1 = 'select SerialNum, KeyName, KeyState, UserID, Shared from KeyInfo where UserID = ? or SharedID = ?';
        let params = [req.session.login.Email, req.session.login.Email];
        connection.query(sql1, params, function (err, result) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else{
                let resultCode = 200;

                res.status(resultCode).json ({
                    'code': resultCode,
                    'message': result
                });
            }
        })
    }
})

module.exports = router;
```

클라이언트(앱)의 리퀘스트 바디는 아무것도 안보내고 url로만 요청을 하면 서버 측에서는 세션에 있는 이메일과 같은 값을 가지고 있는 스마트키의 데이터들을 가져오게 된다(공유된 스마트키도 세션에 저장된 이메일 값을 가지고 불러온다). </br>
서버측은 리스폰스를 다음과 같이 보낸다.

```jsx
{
    "code": 200,
    "message": [
        {
            "SerialNum": "0000000",
            "KeyName": "Living Room",
            "KeyState": "open",
            "UserID": "drgvyhn@gmail.com",
            "Shared": "0"
        }
    ]
}
```

클라이언트(앱)는 Shared키의 값으로 먼저 공유 여부를 확인 후, 공유 상태이면 UserID를 통해 현재 로그인 되어있는 계정의 이메일과 비교해 본다. 같으면 현 계정의 스마트키 이고, 다르면 공유 받은 스마트키 이므로</br>
클라이언트(앱)은 판단 후 소유/공유 목록으로 나누어 주면 된다.

## register_key API

새로운 키를 등록 할 때 사용한다.  클라이언트(앱) 측에서 서버로 리퀘스트할 바디는 다음과 같다.

```jsx
{
    "SerialNum": "0000000",
    "KeyName": "Living Room"
    "smartPwd": "1234"
}
```

그럼 서버측에서는 로그인 세션이 살아 있는지, 해당 키는 이미 등록이 되어있는지 판단하고, 새로운 키가 맞다면 DB에 기록을 한다. 그럼 서버는 클라이언트(앱)에게 다음과 같이 리스폰스를 해준다.

```jsx
{
    "code": 200,
    "message": "새로운 Smart Key Living Room2 이(가) 등록되었습니다."
}
```

다음은 register_key API의 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
const crypto = require("crypto");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/register_key', function (req, res) {
    let serialNum = req.body.serialNum;
    let keyName = req.body.keyName;
    let smartPwd = req.body.smartPwd;

    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else {
        connection.query(sql1, serialNum, function(err, result) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result.length !== 0) {
                res.status(400).json ({
                    'code': 400,
                    'message': '등록하려는 키는 이미 등록이 되어있습니다.'
                })
            }
            else{
                const salt = crypto.randomBytes(32).toString('base64');
                const hashedPw = crypto.pbkdf2Sync(smartPwd, salt, 1, 32, 'sha512').toString('base64');
                
                let sql2 = 'insert into KeyInfo (SerialNum, KeyName, KeyState, UserID, SmartPwd, Salt, Shared) values (?, ?, ?, ?, ?, ?, ?)';
                let params = [serialNum, keyName, 'open', req.session.login.Email, hashedPw, salt, 0];

                let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');

                let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)';
                let params2 = [serialNum, time, 'open', '처음 등록', req.session.login.Email];

                let sql4 = 'insert into Key_Authority(SerialNum, OwnerID) values (?, ?)';
                let parmas3 = [serialNum, req.session.login.Email];

                connection.query(sql2, params, function (err, result) {
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else{
                        connection.query(sql3, params2, function (err, result2) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql4, parmas3, function (err, result3){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        res.status(200).json ({
                                            'code': 200,
                                            'message': '새로운 Smart Key "' + keyName + '" 이(가) 등록되었습니다.'
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;
```

## delete_key API

먼저 <u>Key PW API</u>를 사용해야된다. </br>
클라이언트(앱) 측에서는 먼저 스마트키 비밀번호를 입력해서 인증을 받는다. 다음과 같이 클라이언트(앱)는 서버에 리퀘스트를 한다.

```jsx
{
    "serialNum": "0000001",
    "smartPwd": "1234"
}
```

서버 측에서는 키 비밀번호가 DB에 기록되어 있는 비밀번호와 일치하는지 확인한다.
```jsx
{
    "code": 200,
    "message": "인증되었습니다."
}
```

그러면 클라이언트(앱) 측에서는 어떤 스마트 키를 삭제할 지 서버측에 보내면 된다. 클라이언트(앱) 측은 다음과 같이 서버측으로 보낸다.

```jsx
{
    "SerialNum": "0000001"
}
```

해당 시리얼 넘버가 KeyList 테이블에 존재하면 KeyList테이블에서 삭제를 하고, KeyRecord에서도 위 시러얼 넘버로 기록되어 있는 이력들을 삭제한다. 완료가 되면 스마트 키가 삭제되었다는 메세지와 함께 서버측이 클라이언트(앱)에게 리스폰스를 한다.

```jsx
{
    "code": 200,
    "message": "스마트 키가 삭제되었습니다."
}
```

다음 delete_key.js 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post('/main/delete_key', function (req, res) {
    let serialNum = req.body.serialNum;

    let sql2 = 'delete from KeyInfo where SerialNum = ?';
    let sql3 = 'delete from KeyRecord where SerialNum = ?';
    let sql4 = 'select * from KeyInfo where SerialNum = ?';
    let sql5 = 'select OwnerID from Key_Authority where SerialNum = ?';
    let sql6 = 'delete from Key_Authority where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql5, serialNum, function(err, result4){
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result4[0].OwnerID != req.session.login.Email){
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 되지 않은 계정입니다.'
                })
            }
            else{
                connection.query(sql4, serialNum, function(err, result3) {
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result3.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '해당 스마트키는 등록되지 않았습니다.'
                        })
                    }
                    else {
                        connection.query(sql2, serialNum, function (err, result) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql3, serialNum, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        connection.query(sql6, serialNum, function (err, result6){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                            }
                                            else{
                                                res.status(200).json({
                                                    'code': 200,
                                                    'message': '삭제되었습니다.'
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;
```

## view keyrecord API

클라이언트(앱) 측에서 스마트키의 시리얼 넘버를 보내서 리퀘스트 하면, 서버 측에서는 그 시리얼 넘버에 해당되는 이력들을 리스폰스 해준다. 클라이언트(앱) 측의 쿼리로 다음과 같이 보낸다. </br>
http://서버IP/Smart-Key/main/view_keyrecord/?serialNum=0000001 </br>
보면 엔드 포인트 뒤에 serialNum이란 키와 0000001이라는 값을 쿼리로 서버로 리퀘스트한다.

해당 시리얼 번호로 이력이 저장되어 있으면 그 이력을 리스폰스 해준다.

```jsx
{
    "code": 200,
    "message": [
        {
            "SerialNum": "0000001",
            "Time": "2022-02-02T13:59:32.000Z",
            "KeyState": "open",
            "GPSLat": null,
            "GPSLong": null,
            "Method": "처음 등록",
            "Email": "drgvyhn@gmail.com"
        }
    ]
}
```

다음 keyrecord.js 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/main/view_keyrecord', function(req, res) {
    let serialNum = req.query.serialNum;

    console.log(serialNum);

    let sql1 = 'select SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email from KeyRecord where serialNum = ?';
    let sql2 = 'select OwnerID from Key_Authority where SerialNum = ?';

    if (req.session.login === undefined) {
        res.status(404).json ({
            'code': 404,
            'message': '세션이 만료되었습니다. 다시 로그인 해주세요'
        })
    }
    else{
        connection.query(sql2, serialNum, function(err, result2){
            if (err) {
                console.log(err);
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result2[0].OwnerID != req.session.login.Email){
                res.status(401).json ({
                    'code' : 401,
                    "message" : '허가 받지 않은 계정입니다.'
                })
            }
            else{
                connection.query(sql1, serialNum, function(err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result.length === 0) {
                        res.status(400).json ({
                            'code': 404,
                            'message': '해당 스마트키의 이력이 없습니다.'
                        })
                    }
                    else{
                        res.status(200).json ({
                            'code': 200,
                            'message': result
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;
```

## Key PW API

스마트 키를 제어를 하거나, 지우거나 할 때 스마트키 비밀번호를 인증 받고 나서 해당 기능을 사용하게 할 예정이다. 먼저 클라이언트(앱)에서 서버로 리퀘스트를 보낼 때 json 파일의 형식은 다음과 같다.

```jsx
{
    "serialNum": "0000001",
    "smartPwd": "1234"
}
```

 서버측에서는 해당 시리얼 번호와 스마트키 비밀번호를 가지고 비교를 한 다음 일치하면 인증했다는 리스폰스 메시지를 보낸다.

```jsx
{
    "code": 200,
    "message": "인증되었습니다."
}
```

다음은 keyPW.js의 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
const crypto = require("crypto");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/key_pw', function(req, res){
    let serialNum = req.body.serialNum;
    let smartPwd = req.body.smartPwd;

    let sql1 = 'select * from KeyInfo where SerialNum = ?';
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql1, serialNum, function(err, result1){
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result1.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '해당 스마트키가 DB에 존재하지 않습니다. 다시 등록해주세요.'
                })
            }
            else{
                const hashedPw = crypto.pbkdf2Sync(smartPwd, result1[0].Salt, 1, 32, 'sha512').toString('base64');
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                }
                else if (hashedPw !== result1[0].SmartPwd){
                    res.status(401).json ({
                        'code': 401,
                        'message': '스마트키 비밀번호가 틀렸습니다. 다시 입력해주세요'
                    })
                }
                else{
                    res.status(200).json ({
                        'code': 200,
                        'message': '인증되었습니다.'
                    })
                }
                
            }
        })
    }
})

module.exports = router;
```

## Key Control API

먼저 <u>Key PW API</u>를 호출해 스마트키 비밀번호를 입력 후 서버를 통해 인증 받는다. </br>
앱에서 스마트키를 제어 할 때 사용하는 API이다. 키를 열때와 키를 잠굴 때 따로 url을 만들었으며, 위 Key PW API에서 인증을 받아야 제어를 할 수 있다. 다음은 클라이언트(앱)에서 해당 스마트키를 열거나 닫을 때 다음과 같이 json 파일을 서버로 보내면 된다.

```jsx
{
    "serialNum": "0000001",
    "GPSLong": "10.000",
    "GPSLat": "9.000"
}
```

해당 리퀘스트를  open할려고 하면 만약 이미 open인 상태이면 리스폰스에서 이미 열려있다는 메시지를 보내고, 아니면 열었다는 메시지를 리스폰스로 보낼것이다.

```jsx
{
    "code": 400,
    "message": "스마트키가 이미 열려있습니다."
}
```

```jsx
{
    "code": 200,
    "message": "스마트키가 열렸습니다."
}
```

다음은 keycontrol.js에 대한 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/open_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;

    let sql5 = 'select * from Key_Authority where SerialNum = ?';
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }

    else{
        connection.query(sql5, serialNum, function (err, result5){
            if (result5.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '존재하지 않는 스마트키입니다.'
                })
            }

            else if (result5[0].OwnerID === req.session.login.Email || result5[0].ShareID === req.session.login.Email) {
                connection.query(sql1, serialNum, function (err, result1){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result1.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '존재하지 않는 스마트키입니다.'
                        })
                    }
                    else{
                        let sql4 = 'select KeyState from KeyInfo where SerialNum = ?';

                        connection.query(sql4, serialNum, function(err, result4) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else if (result4[0].KeyState === 'open'){
                                res.status(400).json ({
                                    'code': 400,
                                    'message': '스마트키가 이미 열려있습니다.'
                                })
                            }
                            else{
                                let sql2 = 'update KeyInfo set KeyState = ? where SerialNum = ?';
                                let params = ['open', serialNum];

                                connection.query(sql2, params, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else {
                                        let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
                                        let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email) values (?, ?, ?, ?, ? ,?, ?)';
                                        let params2 = [serialNum, time, 'open', GPSLat, GPSLong, '원격', req.session.login.Email];

                                        connection.query(sql3, params2, function(err, result3){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                            }
                                            else{
                                                res.status(200).json ({
                                                    'code': 200,
                                                    'message': '스마트키가 열렸습니다.'
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }

            else{
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 받지 않은 계정입니다.'
                })
            }
        })
    }
})

router.post('/main/close_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;

    let sql5 = 'select * from Key_Authority where SerialNum = ?';
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }

    else{
        connection.query(sql5, serialNum, function (err, result5){
            if (result5.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '존재하지 않는 스마트키입니다.'
                })
            }

            else if (result5[0].OwnerID === req.session.login.Email || result5[0].ShareID === req.session.login.Email) {
                connection.query(sql1, serialNum, function (err, result1){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result1.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '존재하지 않는 스마트키입니다.'
                        })
                    }
                    else{
                        let sql4 = 'select KeyState from KeyInfo where SerialNum = ?';
        
                        connection.query(sql4, serialNum, function(err, result4) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else if (result4[0].KeyState === 'close'){
                                res.status(400).json ({
                                    'code': 400,
                                    'message': '스마트키가 이미 닫혀있습니다.'
                                })
                            }
                            else{
                                let sql2 = 'update KeyInfo set KeyState = ? where SerialNum = ?';
                                let params = ['close', serialNum];
                        
                                connection.query(sql2, params, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else {
                                        let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
                                        let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method) values (?, ?, ?, ?, ? ,?)';
                                        let params2 = [serialNum, time, 'close', GPSLat, GPSLong, '원격'];
                
                                        connection.query(sql3, params2, function(err, result3){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                            }
                                            else{
                                                res.status(200).json ({
                                                    'code': 200,
                                                    'message': '스마트키가 닫혔습니다.'
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 받지 않은 계정입니다.'
                })
            }
        })
    }
})

module.exports = router;
```
