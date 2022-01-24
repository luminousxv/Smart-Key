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