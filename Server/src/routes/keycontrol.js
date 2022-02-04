const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/main/open_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        req.status(resultCode).json ({
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
                                let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method) values (?, ?, ?, ?, ? ,?)';
                                let params2 = [serialNum, time, 'open', GPSLat, GPSLong, '원격'];
        
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
})

router.post('/main/close_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        req.status(resultCode).json ({
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
                            'message': '스마트키가 이미 잠겨있습니다.'
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
                                            'message': '스마트키가 잠겼습니다.'
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