const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/rpi/remote', function(req, res){
    let serialNum = req.body.serialNum;
    let sql1 = 'select KeyState from KeyInfo where SerialNum = ?';

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

        else{
            res.status(200).json ({
                'code': 200,
                'message': result1[0].KeyState
            })
        }
    })
})

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

module.exports = router;