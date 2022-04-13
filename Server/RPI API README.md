# RPI REMOTE/BLUETOOTH API

## 개요

스마트키가 작동되는 라즈베리파이에서 서버로 접근 할 때 사용하는 API 들이다.

## url
/Smart-Key/rpi/remote

/Smart-Key/rpi/bluetooth

/Smart-Key/rpi/image

## RPI Remote API

스마트키를  원격에서 사용 했을 때 앱에서 제어를 서버로 요청을 한다. 라즈베리파이에서는 앱이 서버로 요청 했는지 알 수가 없으므로 주기적으로 서버로 요청을 해 KeyState값을 요청한다. 클라이언트(RPI)는 다음과 같이 요청을 보낸다.

```jsx
{
    "serialNum": "0000001"
}
```

해당 키의 시리얼 번호가 DB에 등록되어 있다면, 해당 키의 KetState 값을 반환 해준다.

```jsx
{
    "code": 200,
    "state": "open",
    "mode": 0
}
```

“open”이란 값이 반환 되었으므로 RPI에서는 이 값이 저장되어있던 값과 비교를 하면 된다. 같으면, 주기적으로 다시 요청을 하고, 다르면 반환 받은 값에 해당하는 기능을 하면 된다. 'mode'의 키 값으로 0이란 값이 반환 되었다. 0은 일반모드를 의미함으로 원래의 코드를 실행하게 하면 되고, 'mode'의 키 값이 1이면 보안 모드가 실행됨으로 자이로 센서의 값에 따라 사진을 찍어  '/rpi/image'라는 url을 통해 해당 사진을 서버에 request하게 된다.

RPI Remote API 코드이다.

```jsx
router.get('/rpi/remote', function(req, res){
    let serialNum = req.body.serialNum;
    let sql1 = 'select KeyState, Mode from KeyInfo where SerialNum = ?';
    //get KeyState from KeyInfo DB table
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
                'message': '존재하지 않는 스마트키입니다.'
            })
        }
        //delete key
        else if (result1[0].KeyState === 'delete'){
            let sql2 = 'delete from KeyInfo where SerialNum = ?';
            let sql3 = 'delete from KeyRecord where SerialNum = ?';
            let sql4 = 'delete from Key_Authority where SerialNum = ?';

            connection.query(sql2, serialNum, function(err, result2){
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                }
                else{
                    connection.query(sql3, serialNum, function(err, result3){
                        if (err) {
                            res.status(500).json ({
                                'code': 500,
                                'message': 'DB 오류가 발생했습니다.'
                            })
                        }
                        else{
                            connection.query(sql4, serialNum, function(err, result4){
                                if (err) {
                                    res.status(500).json ({
                                        'code': 500,
                                        'message': 'DB 오류가 발생했습니다.'
                                    })
                                }
                                else{
                                    res.status(200).json ({
                                        'code': 200,
                                        'state': result1[0].KeyState
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }

        else{
            res.status(200).json ({
                'code': 200,
                'state': result1[0].KeyState,
                'mode': result1[0].Mode
            })
        }
    })
})
```

## RPI Bluetooth API

앱에서 원격으로 기능을 수행할 때 말고도 블루투스로 스마트키를 열 수 있다. 그 경우, 앱은 서버를 통해 스마트키에 접근하는 것이 아닌, 직접적으로 통신을 하기 때문에 서버에서는 앱이나  RPI에서 요청을 안해주면 이력관리를 할 수 있는 방법이 없다. 그러므로, 블루투스로 제어를 했을 경우,  rpi에서 서버로 시리얼 번호와 수행했던 기능(open/close)와 함께 서버로 요청을 하면, 서버는 해당 값이 유효한지 판단하고  키의 상태(KeyState)와 이력을 갱신한다. 클라이언트(rpi)에서 다음과 같이 요청을 한다.

```jsx
{
    "serialNum": "0000001",
    "keyState": "close"
}
```

해당 시리얼 번호가 존재하고, keyState의 값이 DB에 이미 저장되어 있는 KeyState값과 동일하지 않으면 서버는 다음과 같은 형태로 반환한다.

```jsx
{
    "code": 200,
    "message": "블루투스 제어로 인한 이력을 DB에 저장했습니다."
}
```

다음은 RPI Bluetooth API  코드이다.

```jsx
router.post('/rpi/bluetooth', function(req, res){
    let serialNum = req.body.serialNum;
    let keyState = req.body.keyState;

    let sql1 = 'select KeyState from KeyInfo where SerialNum = ?';

    connection.query(sql1, serialNum, function(err, result1){
        if (err) {
            res.status(500).json ({
                'code': 500,
                'message': 'DB 오류가 발생했습니다.'
            })
        }
        else if (result1.length === 0) {
            res.status(400).json ({
                'code': 400,
                'message': '해당 스마트키는 DB에 등록되지 않았습니다.'
            })
        }
        else if (result1[0].KeyState === keyState) {
            res.status(400).json ({
                'code': 400,
                'message': '이미 해당 스마트키는 ' + keyState + ' 인 상태입니다.'
            })
        }
        else{
            let sql2 = 'update KeyInfo set KeyState = ? where SerialNum = ?';
            let params2 = [keyState, serialNum];
        
            connection.query(sql2, params2, function(err, result2){
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                }
        
                else{
                    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
                    let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method) values (?, ?, ?, ?)';
                    let parmas3 = [serialNum, time, keyState, '블루투스'];
        
                    connection.query(sql3, parmas3, function(err, result3){
                        if (err) {
                            res.status(500).json ({
                                'code': 500,
                                'message': 'DB 오류가 발생했습니다.'
                            })
                        }
                        else{
                            res.status(200).json ({
                                'code': 200,
                                'message': '블루투스 제어로 인한 이력을 DB에 저장했습니다.'
                            })
                        }
                    })
                }
            })
        }
    })
})
```

## RPI Image API

보안모드 일 시, 자이로 센서의 값이 변화되면 스마트키의 카메라를 통해 사진을 찍고, 서버로 전송해서 이력을 남기는 API이다.

```jsx
{
    "serialNum": "0000001",
    "image" : "(base64로 인코딩 된 이미지)"
}
```

RPI에서는 위와 같은 방싣으로 서버에게 보낸다. 서버에서는 해당 사진을  KeyRecord DB 테이블의 애트리뷰트로 저장을 하고, 나중 앱에서 이력을 요청 할 때 반환해준다.

다음은 rpi_image.js 코드이다.

```jsx
const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/rpi/image', function(req, res) {
    let serialNum = req.body.serialNum;
    let image = req.body.image;

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql1 = 'select KeyState from KeyInfo where SerialNum = ?';
    let sql2 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method, Image) values (?, ?, ?, ?, ?)';

    connection.query(sql1, serialNum, function(err, result1){
        if (err) {
            res.status(500).json ({
                'code': 500,
                'message': 'DB 오류가 발생했습니다.'
            })
            console.log('select KeyState from KeyInfo error');
            console.log(err);
        }
        else if (result1.length === 0){
            res.status(400).json ({
                'code': 400,
                'message': '존재하지 않는 스마트키입니다.'
            })
        }
        else{
            let params2 = [serialNum, time, result1[0].KeyState, '보안모드: 사진', image];
            connection.query(sql2, params2, function(err, result2){
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                    console.log('insert into KeyRecord error');
                    console.log(err);
                }
                else{
                    res.status(200).json ({
                        'code': 200,
                        'message': '사진을 서버에 저장했습니다.'
                    })
                }
            })
        }
    })
})

module.exports = router;
```