const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Smart Key Remote Open API
router.post('/main/open_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;

    console.log('---입력값---');
    console.log('시리얼번호: '+ serialNum);
    console.log('GPS Longitude: '+ GPSLong);
    console.log('GPS Latitude: '+ GPSLat)
    console.log('----------');

    let sql5 = 'select * from Key_Authority where SerialNum = ?';
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    //check login session
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }

    else{
        //check authority
        connection.query(sql5, serialNum, function (err, result5){
            if (result5.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '존재하지 않는 스마트키입니다.'
                })
                
            }
            else if (err){
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
                console.log('select error from Key_Authority table');
                console.log(err);
            }
            else if (result5[0].OwnerID === req.session.login.Email || result5[0].ShareID === req.session.login.Email) {
                //get Smart Key from KeyInfo DB table
                connection.query(sql1, serialNum, function (err, result1){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                        console.log('select error from KeyInfo table');
                        console.log(err);
                    }
                    else if (result1.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '존재하지 않는 스마트키입니다.'
                        })
                    }
                    else{
                        let sql4 = 'select KeyState from KeyInfo where SerialNum = ?';
                        //check Smart Key's state(open/close)
                        connection.query(sql4, serialNum, function(err, result4) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                                console.log('select error from KeyInfo table');
                                console.log(err);
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
                                //change Smart Key's state(close -> open) from KeyInfo DB table
                                connection.query(sql2, params, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                        console.log('update error from KeyInfo table');
                                        console.log(err);
                                    }
                                    else {
                                        let time  = moment().format('YYYY-MM-DD HH:mm:ss');
                                        let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email) values (?, ?, ?, ?, ? ,?, ?)';
                                        let params2 = [serialNum, time, 'open', GPSLat, GPSLong, '원격', req.session.login.Email];
                                        //add Smart Key's record to KeyRecord DB table
                                        connection.query(sql3, params2, function(err, result3){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                                console.log('insert error from KeyRecord table');
                                                console.log(err);
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

//Smart Key Remote Close API
router.post('/main/close_key', function(req, res){
    let serialNum = req.body.serialNum;
    let GPSLong = req.body.GPSLong;
    let GPSLat = req.body.GPSLat;

    console.log('---입력값---');
    console.log('시리얼번호: '+ serialNum);
    console.log('GPS Longitude: '+ GPSLong);
    console.log('GPS Latitude: '+ GPSLat)
    console.log('----------');

    let sql5 = 'select * from Key_Authority where SerialNum = ?';
    let sql1 = 'select * from KeyInfo where SerialNum = ?';

    //check login session
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    //check authority
    else{
        connection.query(sql5, serialNum, function (err, result5){
            if (result5.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '존재하지 않는 스마트키입니다.'
                })
            }
            else if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
                console.log('select error from Key_Authority table');
                console.log(err);
            }
            else if (result5[0].OwnerID === req.session.login.Email || result5[0].ShareID === req.session.login.Email) {
                //get Smart Key from KeyInfo DB table
                connection.query(sql1, serialNum, function (err, result1){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                        console.log('select error from KeyInfo table');
                        console.log(err);
                    }
                    else if (result1.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '존재하지 않는 스마트키입니다.'
                        })
                    }
                    else{
                        let sql4 = 'select KeyState from KeyInfo where SerialNum = ?';
                        //check Smart Key's state(open/close)
                        connection.query(sql4, serialNum, function(err, result4) {
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                                console.log('select error from KeyInfo table');
                                console.log(err);
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
                                //change Smart Key's state(open -> close) from KeyInfo DB table
                                connection.query(sql2, params, function (err, result2){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                        console.log('update error from KeyInfo table');
                                        console.log(err);
                                    }
                                    else {
                                        let time  = moment().format('YYYY-MM-DD HH:mm:ss');
                                        let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email) values (?, ?, ?, ?, ? ,?, ?)';
                                        let params2 = [serialNum, time, 'close', GPSLat, GPSLong, '원격', req.session.login.Email];
                                        //add Smart Key's record to KeyRecord DB table
                                        connection.query(sql3, params2, function(err, result3){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                                console.log('insert error from KeyRecord table');
                                                console.log(err);
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

router.post('/main/mode', function(req, res){
    let serialNum = req.body.serialNum;

    console.log('---입력값---');
    console.log('시리얼번호: '+ serialNum);
    console.log('----------');

    let sql1 = 'select KeyState, Mode from KeyInfo where SerialNum = ?'
    let sql2 = 'update KeyInfo set Mode = ? where SerialNum = ?';
    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)';

    //check login session
    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }

    connection.query(sql1, serialNum, function(err, result1){
        if (err) {
            res.status(500).json ({
                'code': 500,
                'message': 'DB 오류가 발생했습니다.'
            })
            console.log('select KeyState, Mode from KeyInfo error');
            console.log(err);
        }
        else if (result1[0].Mode === 0){
            let params2 = [1, serialNum];
            connection.query(sql2, params2, function(err, result2){
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                    console.log('update Mode from KeyInfo error');
                    console.log(err);
                }
                else{
                    let params3 = [serialNum, time, result1[0].KeyState, '보안모드로 변경', req.session.login.Email]
                    connection.query(sql3, params3, function(err, result3){
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
                                'message': '스마트키가 보안모드로 변경되었습니다.'
                            })
                        }
                    })
                }
            })
        }
        else{
            let params2 = [0, serialNum];
            connection.query(sql2, params2, function(err, result2){
                if (err) {
                    res.status(500).json ({
                        'code': 500,
                        'message': 'DB 오류가 발생했습니다.'
                    })
                    console.log('update Mode from KeyInfo error');
                    console.log(err);
                }
                else{
                    let params3 = [serialNum, time, result1[0].KeyState, '일반모드로 변경', req.session.login.Email]
                    connection.query(sql3, params3, function(err, result3){
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
                                'message': '스마트키가 일반모드로 변경되었습니다.'
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = router;