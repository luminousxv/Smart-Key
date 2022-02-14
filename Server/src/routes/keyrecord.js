const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/main/view_keyrecord', function(req, res) {
    let serialNum = req.body.serialNum;

    let sql1 = 'select SerialNum, Time, KeyState, GPSLat, GPSLong, Method from KeyRecord where serialNum = ?';

    if (req.session.login === undefined) {
        res.status(404).json ({
            'code': 404,
            'message': '세션이 만료되었습니다. 다시 로그인 해주세요'
        })
    }
    else{
        connection.query(sql1, serialNum, function(err, result) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result.length === 0) {
                res.status(400).json ({
                    'code': 404,
                    'message': '해당 스마트키의 이력이 없습니다.'
                })
            }
            else{
                res.status(200).json ({
                    'code': 200,
                    'message': result
                })
            }
        })
    }
})

module.exports = router;