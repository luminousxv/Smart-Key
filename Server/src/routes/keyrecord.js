const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/main/view_keyrecord', function(req, res) {
    let serialNum = req.query.serialNum;

    console.log(serialNum);

    let sql1 = 'select SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email from KeyRecord where serialNum = ?';
    let sql2 = 'select OwnerID from Key_Authority where SerialNum = ?';
    let sql3 = 'select * from KeyInfo where SerialNum = ?';
    //check login session
    if (req.session.login === undefined) {
        res.status(404).json ({
            'code': 404,
            'message': '세션이 만료되었습니다. 다시 로그인 해주세요'
        })
    }
    else{
        //select data from KeyInfo DB
        connection.query(sql3, serialNum, function (err, result3){
            if (err) {
                console.log(err);
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if(result3.length === 0){
                res.status(400).json ({
                    'code': 404,
                    'message': '해당 스마트키의 이력이 없습니다.'
                })
            }
            else{
                //check key's authority(whether the login email is the owner)
                connection.query(sql2, serialNum, function(err, result2){
                    if (err) {
                        console.log(err);
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result2[0].OwnerID != req.session.login.Email){
                        res.status(401).json ({
                            'code' : 401,
                            "message" : '허가 받지 않은 계정입니다.'
                        })
                    }
                    else{
                        //select serial number, time, key's state, GPS data, 
                        //control method, controlled email from KeyRecord DB table
                        connection.query(sql1, serialNum, function(err, result) {
                            if (err) {
                                console.log(err)
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
            }
        })
    }
})

module.exports = router;