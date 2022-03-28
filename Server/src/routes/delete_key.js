const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Smart Key Delete API
router.post('/main/delete_key', function (req, res) {
    let serialNum = req.body.serialNum;

    let sql2 = 'delete from KeyInfo where SerialNum = ?';
    let sql3 = 'delete from KeyRecord where SerialNum = ?';
    let sql4 = 'select * from KeyInfo where SerialNum = ?';
    let sql5 = 'select OwnerID from Key_Authority where SerialNum = ?';
    let sql6 = 'delete from Key_Authority where SerialNum = ?';

    //check login session
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 하세요.';

        res.status(resultCode). json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        //check authority
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
                //get Smart Key from KeyInfo DB table
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
                        //delete Smart Key from KeyInfo DB table
                        connection.query(sql2, serialNum, function (err, result) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                //delete Smart Key's records from KeyRecord DB table
                                connection.query(sql3, serialNum, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        //delete Smart Key's authority from Key_Authority DB table
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