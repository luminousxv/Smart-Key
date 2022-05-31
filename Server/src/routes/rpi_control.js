const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//RPI Remote API
router.get('/rpi/remote', function(req, res){
    let serialNum = req.body.serialNum;

    console.log('---입력값---');
    console.log('시리얼 번호: '+ serialNum);
    console.log('----------');

    let sql1 = 'select KeyState, Mode from KeyInfo where SerialNum = ?';
    //get KeyState from KeyInfo DB table
    connection.query(sql1, serialNum, function(err, result1){
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
                    console.log('delete error from KeyInfo table');
                    console.log(err);
                }
                else{
                    connection.query(sql3, serialNum, function(err, result3){
                        if (err) {
                            res.status(500).json ({
                                'code': 500,
                                'message': 'DB 오류가 발생했습니다.'
                            })
                            console.log('delete error from KeyRecord table');
                            console.log(err);
                        }
                        else{
                            connection.query(sql4, serialNum, function(err, result4){
                                if (err) {
                                    res.status(500).json ({
                                        'code': 500,
                                        'message': 'DB 오류가 발생했습니다.'
                                    })
                                    console.log('delete error from Key_Authority table');
                                    console.log(err);
                                }
                                else{
                                    res.status(200).json ({
                                        'code': 300,
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
//RPI Bluetooth API
router.post('/rpi/bluetooth', function(req, res){
    let serialNum = req.body.serialNum;
    let keyState = req.body.keyState;
    console.log('---입력값---');
    console.log('시리얼 번호: '+ serialNum);
    console.log('키 상태: '+keyState);
    console.log('----------');

    let sql1 = 'select KeyState from KeyInfo where SerialNum = ?';

    connection.query(sql1, serialNum, function(err, result1){
        if (err) {
            res.status(500).json ({
                'code': 500,
                'message': 'DB 오류가 발생했습니다.'
            })
            console.log('select error from KeyInfo table');
            console.log(err);
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
                    console.log('update error from KeyInfo table');
                    console.log(err);
                }
        
                else{
                    let time  = moment().format('YYYY-MM-DD HH:mm:ss');
                    let sql3 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method) values (?, ?, ?, ?)';
                    let parmas3 = [serialNum, time, keyState, '블루투스'];
        
                    connection.query(sql3, parmas3, function(err, result3){
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
                                'message': '블루투스 제어로 인한 이력을 DB에 저장했습니다.'
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = router;