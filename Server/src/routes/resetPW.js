const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const crypto = require("crypto");
var bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require('session-file-store') (session);
const nodemailer = require("nodemailer");
let cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session ({
    secret: 'passwordreset',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie:{maxAge: 900000} //2minutes
}));

const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    port: 465,
    secure: true,
    auth : {
        user: "drgvyhn@gmail.com",
        pass: "wxgfmpwbkywmfnix"
    }
});

router.post('/user/reset/email', function(req, res) {
    let userEmail = req.body.userEmail;
    let userName = req.body.userName;
    let userBirth = req.body.userBirth;

    console.log('입력값: ' + userEmail + ' ' + userName + ' ' + userBirth);

    let sql1 = 'select * from Users where UserEmail = ? and UserName = ? and UserBirth = ?';
    let params = [userEmail, userName, userBirth];

    connection.query(sql1, params, function(err, result) {
        if (err) {
            let resultCode = 404;
            let message = '에러가 발생했습니다.';
            console.log(err);

            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }

        else if (result.length ===0) {
            let resultCode = 400;
            let message = '존재하지 않는 회원정보입니다. 다시 입력해주세요.';

            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }

        else{
            let resultCode = 200;
            let message = '이메일 인증을 위해 ' + result[0].UserEmail + ' 으로 이메일을 보냈습니다.';
            
            let authNum = Math.random().toString().substr(2, 6);

            req.session.reset = {
                Email: userEmail,
                Auth: authNum
            };

            const mailOptions = {
                from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
                to: req.session.reset.Email,
                subject: "Smart Key 비밀번호 초기화 인증 번호 메일입니다.",
                text: "인증번호는 " + authNum + " 입니다."
            };

            smtpTransport.sendMail(mailOptions, (err, res) => {
                if(err) {
                    console.log(err);
                } else{
                    console.log('success');
                }
            });
            console.log('세션 아이디: ' + req.sessionID);
            console.log('----reset 세션----');
            console.log(req.session.reset);
            res.status(resultCode).json ({
                'code': resultCode,
                'message': message
            });
        }
    })
})

router.post('/user/reset/verification', function (req, res) {
    let inputAuth = req.body.inputAuth;
    console.log('입력값: ' + inputAuth);
    console.log('----reset 세션----');
    console.log(req.session.reset);

    if (req.session.reset === undefined) {
        let resultCode = 404;
        let message = '인증번호가 만료 되었습니다. 처음부터 다시 해주세요.';

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else if (inputAuth !== req.session.reset.Auth) {
        let resultCode = 400;
        let message = '인증번호가 틀렸습니다. 다시 입력해 주세요.';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else{
        let resultCode = 200;
        let message = '이메일 인증이 완료되었습니다.';

        req.session.reset.auth = '';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }
})

router.post('/user/reset/change_pw', function (req, res) {
    let userPwd = req.body.userPwd;
    console.log('입력값: ' + userPwd);

    if (formSearch(userPwd)) {
        let resultCode = 400;
        let message = '비밀번호는 9자리 이상이어야 합니다. 다시 입력해주세요.';

        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
    }

    else {
        //Encryption: using salt as a key to encrypt the password
        const salt = crypto.randomBytes(32).toString('base64');
        const hashedPw = crypto.pbkdf2Sync(userPwd, salt, 1, 32, 'sha512').toString('base64');

        let sql2 = 'update Users set UserPwd = ?, Salt = ? where UserEmail = ?';

        connection.query(sql2, [hashedPw, salt, req.session.reset.Email], function (err, result){
            if (err) {
                let resultCode = 404;
                let message = '에러가 발생했습니다.'
                console.log(err);

                res.status(resultCode).json({
                    'code': resultCode,
                    'message': message
                });
            }
            else{
                let resultCode = 200;
                let message = '비밀번호 변경에 성공하셨습니다.';

                res.status(resultCode).json({
                    'code': resultCode,
                    'message': message
                });
                req.session.destroy();
            }
        });
    }
})

//Form Checking function
function formSearch(pw, name, email, birth) {
    if (pw.length < 8) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;