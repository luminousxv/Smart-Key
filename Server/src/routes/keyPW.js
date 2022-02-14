const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
const crypto = require("crypto");
let cookieParser = require("cookie-parser");

router.use(cookieParser());


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