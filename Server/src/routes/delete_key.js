const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
const crypto = require("crypto");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/delete_key/pw', function(req, res) {
    let userPwd = req.body.userPwd;

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

router.post('/main/delete_key/success', function (req, res) {
    let serialNum = req.body.serialNum;
    let smartPwd = req.body.smartPwd;

    let sql2 = 'delete from KeyInfo where SerialNum = ?';
    let sql3 = 'delete from KeyRecord where SerialNum = ?';
    let sql4 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql4, serialNum, function(err, result3) {
            const hashedPw = crypto.pbkdf2Sync(smartPwd, result3[0].Salt, 1, 32, 'sha512').toString('base64');
            console.log(result3);
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (hashedPw !== result3[0].SmartPwd) {
                res.status(400).json ({
                    'code': 400,
                    'message': '스마트 키 비밀번호가 틀렸습니다.'
                })
            }

            else{
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

module.exports = router;