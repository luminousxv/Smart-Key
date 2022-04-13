const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
const crypto = require("crypto");
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ 
    extended: true
}));

//Register Key API
router.post('/main/register_key', function (req, res) {
    let serialNum = req.body.serialNum;
    let keyName = req.body.keyName;
    let smartPwd = req.body.smartPwd;
    let keyImage = req.body.keyImage;

    console.log(serialNum);
    console.log(keyName);
    console.log(smartPwd);

    let sql1 = 'select * from KeyInfo where SerialNum = ?';
    //check login session
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else {
        //check KeyInfo DB table if key is registered
        connection.query(sql1, serialNum, function(err, result) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
                console.log('select error');
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
                
                let sql2 = 'insert into KeyInfo (SerialNum, KeyName, KeyState, UserID, SmartPwd, Salt, Shared, Image, Mode) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                let params = [serialNum, keyName, 'open', req.session.login.Email, hashedPw, salt, 0, keyImage, 0];

                let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');

                let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)';
                let params2 = [serialNum, time, 'open', '처음 등록', req.session.login.Email];

                let sql4 = 'insert into Key_Authority(SerialNum, OwnerID) values (?, ?)';
                let parmas3 = [serialNum, req.session.login.Email];

                //insert key's data to KeyInfo DB table
                connection.query(sql2, params, function (err, result) {
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                        console.log('insert into KeyInfo error');
                        console.log(err);
                    }
                    else{
                        //insert key record to KeyRecord DB table
                        connection.query(sql3, params2, function (err, result2) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                                console.log('insert into KeyRecord error');
                                console.log(err);
                            }
                            else{
                                //insert owner's email to Key_Authority DB table
                                connection.query(sql4, parmas3, function (err, result3){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                        console.log('insert into Key_Authority error');
                                        console.log(err);
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