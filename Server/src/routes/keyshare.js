const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/share_key/register', function (req, res){
    let serialNum = req.body.serialNum;
    let shareEmail = req.body.shareEmail;

    let sql1 = 'select * from Key_Authority where SerialNum = ?';

    let sql2 = 'update KeyInfo set Shared = ?, SharedID = ? where SerialNum = ?';
    let params2 = [1, shareEmail, serialNum];
    
    let sql3 = 'update Key_Authority set ShareID = ? where SerialNum = ?';
    let params3 = [shareEmail, serialNum];

    let sql4 = 'select * from Users where UserEmail = ?';

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql5 = 'insert into KeyRecord (SerialNum, Time, Method, Email) values (?, ?, ?, ?)';
    let params5 = [serialNum, time, shareEmail + ' 에게 공유', req.session.login.Email];

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql1, serialNum, function (err, result1){
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result1.length === 0){
                res.status(404).json ({
                    'code': 404,
                    'message': '해당 스마트키가 존재하지 않습니다.'
                })
            }
            else if (result1[0].ShareID != null){
                res.status(400).json ({
                    'code': 400,
                    'message': '이미 공유 받은 계정이 존재합니다.'
                })
            }
            else if (result1[0].OwnerID != req.session.login.Email) {
                res.status(401).json ({
                    'code': 400,
                    'message': '허가 받지 않는 계정입니다.'
                })
            }
            else{
                connection.query(sql4, shareEmail, function (err, result4){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result4.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '공유 받을 계정이 존재하지 않습니다.'
                        })
                    }
                    else{
                        connection.query(sql2, params2, function (err, result2){
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql3, params3, function (err, result3){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        connection.query(sql5, params5, function(err, result5){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                            }
                                            else{
                                                res.status(200).json ({
                                                    'code': 200,
                                                    'message': '공유가 완료 되었습니다.'
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

router.post('/main/share_key/delete', function (req, res){
    let serialNum = req.body.serialNum;

    let sql1 = 'select * from Key_Authority where SerialNum = ?';

    let sql2 = 'update Key_Authority set ShareID = ? where SerialNum = ?';
    let params2 = [null, serialNum];

    let sql3 = 'update KeyInfo set Shared = ?, SharedID = ? where SerialNum = ?';
    let params3 = [0, null, serialNum];

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql4 = 'insert into KeyRecord (SerialNum, Time, Method, Email) values (?, ?, ?, ?)';
    let params4 = [serialNum, time, '공유 삭제', req.session.login.Email];

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql1, serialNum, function (err, result1){
            if (err) {
                console.log(err);
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result1.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '해당 스마트키가 존재하지 않습니다.'
                })
            }
            else if (result1[0].OwnerID != req.session.login.Email) {
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 받지 않은 계정입니다.'
                })
            }
            else if (result1[0].ShareID == null) {
                res.status(400).json ({
                    'code': 400,
                    'message': '공유 받은 계정이 존재하지 않습니다.'
                })
            }
            else{
                connection.query(sql2, params2, function (err, result2){
                    if (err) {
                        console.log(err);
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else{
                        connection.query(sql3, params3, function (err, result3){
                            if (err) {
                                console.log(err);
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql4, params4, function (err, result4){
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        res.status(200).json ({
                                            'code': 200,
                                            'message': '공유 계정을 삭제했습니다.'
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