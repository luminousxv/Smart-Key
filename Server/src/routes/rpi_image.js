const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/rpi/image', function(req, res) {
    let serialNum = req.body.serialNum;
    let image = req.body.image;

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql1 = 'select KeyState from KeyInfo where SerialNum = ?';
    let sql2 = 'insert into KeyRecord (SerialNum, Time, KeyState, Method, Image) values (?, ?, ?, ?, ?)';

    connection.query(sql1, serialNum, function(err, result1){
        if (err) {
            res.status(500).json ({
                'code': 500,
                'message': 'DB 오류가 발생했습니다.'
            })
            console.log('select KeyState from KeyInfo error');
            console.log(err);
        }
        else if (result1.length === 0){
            res.status(400).json ({
                'code': 400,
                'message': '존재하지 않는 스마트키입니다.'
            })
        }
        else{
            let params2 = [serialNum, time, result1[0].KeyState, '보안모드: 사진', image];
            connection.query(sql2, params2, function(err, result2){
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
                        'message': '사진을 서버에 저장했습니다.'
                    })
                }
            })
        }
    })
})

module.exports = router;