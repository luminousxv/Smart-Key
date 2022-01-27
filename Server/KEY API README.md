# KEYLIST/REGISTER_KEY API

## 개요

DB에서 KeyInfo라는 테이블을 이용해 테이블을 등록, 조회, 삭제를 하는  API들이다. (1.24 수정)

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

router.get('/view/KeyList', function (req, res) {
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        req.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    
    else{
        let sql1 = 'select * from KeyInfo where UserID = ?';

        connection.query(sql1, req.session.login.Email, function (err, result) {
            if (err) {
                req.status(500).json ({
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

클라이언트의 리퀘스트 바디는 아무것도 안보내고 url로만 요청을 하면 서버 측에서는 세션에 있는 이메일과 같은 값을 가지고 있는 스마트키의 데이터들을 가져오게 된다. 서버측은 리스폰스를 다음과 같이 보낸다.

```jsx
{
    "code": 200,
    "message": [
        {
            "KeyID": 1,
            "SerialNum": "0000000",
            "KeyName": "Living Room",
            "KeyState": "open",
            "UserID": "drgvyhn@gmail.com"
        }
    ]
}
```

## register_key API

새로운 키를 등록 할 때 사용한다.  클라이언트 측에서 서버로 리퀘스트할 바디는 다음과 같다.

```jsx
{
    "SerialNum": "0000000",
    "KeyName": "Living Room"
}
```

그럼 서버측에서는 로그인 세션이 살아 있는지, 해당 키는 이미 등록이 되어있는지 판단하고, 새로운 키가 맞다면 DB에 기록을 한다. 그럼 서버는 클라이언트에게 다음과 같이 리스폰스를 해준다.

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

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/register_key', function (req, res) {
    let serialNum = req.body.SerialNum;
    let keyName = req.body.KeyName;

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
                let sql2 = 'insert into KeyInfo (SerialNum, KeyName, KeyState, UserID) values (?, ?, ?, ?)';
                let params = [serialNum, keyName, 'open', req.session.login.Email];

                connection.query(sql2, params, function (err, result) {
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

module.exports = router;
```

## delete_key API

등록되어 있는 키를 삭제를 할 때 사용이 된다. 클라이언트 측에서는 먼저 비밀번호를 입력해서 인증을 받는다. 다음과 같이 클라이언트는 서버에 리퀘스트를 한다.

```jsx
{
    "UserPwd": "987654321"
}
```

서버 측에서는 세션에 저장되어 있는 이메일을 통해  Users테이블에 있는  salt값을 가지고 리퀘스트 받은 비밀번호를 암호화 하고 저장되어 있는 비밀번호와 비교 후, 같으면 인증이 되는 방식이다. 리스폰스는 다음과 같이 서버가 클라이언트 측으로 보낸다.

```jsx
{
    "code": 200,
    "message": "인증되었습니다."
}
```

그러면 클라이언트 측에서는 어떤 스마트 키를 삭제할 지 서버측에 보내면 된다. 클라이언트 측은 다음과 같이 서버측으로 보낸다.

```jsx
{
    "SerialNum": "0000001"
}
```

해당 시리얼 넘버가 KeyList 테이블에 존재하면 KeyList테이블에서 삭제를 하고, KeyRecord에서도 위 시러얼 넘버로 기록되어 있는 이력들을 삭제한다. 완료가 되면 스마트 키가 삭제되었다는 메세지와 함께 서버측이 클라이언트에게 리스폰스를 한다.

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
const crypto = require("crypto");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/delete_key/verification', function(req, res) {
    let userPwd = req.body.UserPwd;

    let sql1 = 'select * from Users where UserEmail = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }

    else{
        connection.query(sql1, req.session.login.Email, function (err, result) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else{
                const salt = crypto.randomBytes(32).toString('base64');
                const hashedPw = crypto.pbkdf2Sync(userPwd, result[0].Salt, 1, 32, 'sha512').toString('base64');

                if (hashedPw !== result[0].UserPwd) {
                    resultCode = 400;
                    message = '존재하지 않는 계정입니다.';

                    res.status(resultCode). json ({
                        'code': resultCode,
                        'message': message
                    });
                }
                else{
                    resultCode = 200;
                    message = '인증되었습니다.'

                    res.status(resultCode). json ({
                        'code': resultCode,
                        'message': message
                    });
                }
            }
        })
    }
})

router.post('/delete_key', function (req, res) {
    let serialNum = req.body.SerialNum;

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');

    let sql2 = 'delete from KeyInfo where SerialNum = ?';
    let sql3 = 'delete from KeyRecord where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql2, serialNum, function(err, result) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB1 오류가 발생했습니다.'
                })
            }
            else{
                connection.query(sql3, serialNum, function(err2, result2) {
                    if (err2) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB2 오류가 발생했습니다.'
                        })
                    }
                    else{
                        res.status(200).json ({
                            'code': 200,
                            'message': '스마트 키가 삭제되었습니다.'
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;
```