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
    let sql1 = 'select OwnerID from Key_Authority where SerialNum = ?';
    let sql2 = 'update KeyInfo set KeyState = ? where SerialNum = ?';
    let params2 = ['delete', serialNum];

    console.log('---입력값---');
    console.log('시리얼번호: '+ serialNum)
    console.log('----------');

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
        //change KeyState from KeyInfo DB table to delete
        connection.query(sql1, serialNum, function(err, result1){
            if (err){
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
                console.log('select error from Key_Authority table');
                console.log(err);
            }
            else if (result1[0].OwnerID != req.session.login.Email){
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 되지 않은 계정입니다.'
                })
            }
            else if (result1[0].length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '해당 스마트키는 등록되지 않았습니다.'
                })
            }
            else{
                connection.query(sql2, params2, function(err, result2){
                    if (err){
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                        console.log('update error from KeyInfo table');
                        console.log('err');
                    }
                    else{
                        res.status(200).json({
                            'code': 200,
                            'message': '스마트키에게 삭제 요청을 보냈습니다. 곧 삭제가 될 것입니다.'
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;