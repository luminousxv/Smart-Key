const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/main/view_keylist', function (req, res) {
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
        let sql1 = 'select SerialNum, KeyName, KeyState, UserID, Shared, Mode from KeyInfo where UserID = ? or SharedID = ?';
        let params1 = [req.session.login.Email, req.session.login.Email];
        //get serial number, key name, key's state(open/close), owner email, shared pending value from KeyInfo DB
        connection.query(sql1, params1, function (err, result1) {
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
                console.log('select error from KeyInfo table');
                console.log(err);
            }
            else{
                let resultCode = 200
                res.status(resultCode).json ({
                    'code': resultCode,
                    'message': result1
                });
            }
        })
    }    
})

module.exports = router;