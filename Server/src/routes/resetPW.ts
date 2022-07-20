/* eslint-disable no-console */
import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import GoogleLogin from "../config/google.json";
import { RequestResetPw, Users } from "../types/type";
import Sql from "../modules/sql";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileStore = require("session-file-store")(session);

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Form Checking function
function formSearch(pw: string): boolean {
  if (pw.length < 8) {
    return true;
  }
  return false;
}

router.use(
  session({
    secret: "passwordreset",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: { maxAge: 900000 }, // 2minutes
  })
);

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: GoogleLogin.user,
    pass: GoogleLogin.pass,
  },
});
// Reset API(Email)
router.post("/user/reset/email", (req, res) => {
  const reqObj: RequestResetPw = req.body;

  console.log("---입력값---");
  console.log(`이메일: ${reqObj.userEmail}`);
  console.log(`이름: ${reqObj.userName}`);
  console.log(`생년월일: ${reqObj.userBirth}`);
  console.log("-----------");

  const sql1: string = Sql.PWReset.select;
  const params = [reqObj.userEmail, reqObj.userName, reqObj.userBirth];
  const authNum = Math.random().toString().substr(2, 6);

  // check whether input data is valid in Users DB table
  connection.query(sql1, params, (err, result: Users[]) => {
    if (err) {
      res.status(500).json({
        code: 500,
        message: "에러가 발생했습니다.",
      });
      console.log("select error from Users table");
      console.log(err);
      return;
    }
    if (result.length === 0) {
      res.status(400).json({
        code: 400,
        message: "존재하지 않는 회원정보입니다. 다시 입력해주세요.",
      });
      return;
    }
    // reset session
    req.session.reset = {
      Email: reqObj.userEmail,
      Auth: authNum,
    };

    // verification number email setup
    const mailOptions = {
      from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
      to: req.session.reset.Email,
      subject: "Smart Key 비밀번호 초기화 인증 번호 메일입니다.",
      text: `인증번호는 ${authNum} 입니다.`,
    };
    // send email
    smtpTransport.sendMail(mailOptions, (mailerror) => {
      if (mailerror) {
        console.log("Email not sent.");
        console.log(err);
        res.status(404).json({
          code: 404,
          message: "인증번호 이메일이 발송되지 않았습니다. 다시 시도해 보세요.",
        });
        return;
      }
      console.log("Email sent.");
    });
    console.log("----reset 세션----");
    console.log(`세션 아이디: ${req.sessionID}`);
    console.log(req.session.reset);
    console.log("----------");
    res.status(200).json({
      code: 200,
      message: "이메일로 인증번호가 발송되었습니다.",
    });
  });
});

// Reset API(Verification)
router.post("/user/reset/verification", (req, res) => {
  const { inputAuth } = req.body;

  console.log("---입력값---");
  console.log(`인증번호: ${inputAuth}`);
  console.log("----------");
  console.log("----reset 세션----");
  console.log(req.session.reset);
  console.log("----------");

  // check reset session
  if (req.session.reset === undefined) {
    res.status(404).json({
      code: 404,
      message: "인증번호가 만료 되었습니다. 처음부터 다시 해주세요.",
    });
    return;
  }
  // check input verification number
  if (inputAuth !== req.session.reset.Auth) {
    res.status(400).json({
      code: 400,
      message: "인증번호가 틀렸습니다. 다시 입력해 주세요.",
    });
    return;
  }
  req.session.reset.Auth = "";
  res.status(200).json({
    code: 200,
    message: "이메일 인증이 완료되었습니다.",
  });
});

// Reset API(Change Password)
router.post("/user/reset/change_pw", (req, res) => {
  const { userPwd } = req.body;

  console.log("---입력값---");
  console.log(`바꿀 비밀번호: ${userPwd}`);
  // check if input pw is 9 digits or more
  if (formSearch(userPwd as string)) {
    res.status(400).json({
      code: 400,
      message: "비밀번호는 9자리 이상이어야 합니다. 다시 입력해주세요.",
    });
    return;
  }
  // Encryption: using salt as a key to encrypt the password
  const salt = crypto.randomBytes(32).toString("base64");
  const hashedPw = crypto
    .pbkdf2Sync(userPwd, salt, 1, 32, "sha512")
    .toString("base64");

  if (req.session.reset === undefined) {
    res.status(404).json({
      code: 404,
      message: "세션이 만료되었습니다. 다시 로그인 해주세요.",
    });
    return;
  }

  const sql: string = Sql.PWReset.update;
  const params = [hashedPw, salt, req.session.reset.Email];

  connection.query(sql, params, (err) => {
    if (err) {
      res.status(404).json({
        code: 404,
        message: "에러가 발생했습니다.",
      });
      console.log("update error from Users table");
      console.log(err);
      return;
    }
    res.status(200).json({
      code: 200,
      message: "비밀번호 변경에 성공하셨습니다.",
    });

    // delete session
    if (req.session.reset) {
      req.session.destroy((sessionerr) => {
        if (sessionerr) {
          throw err;
        }
      });
      console.log("Reset Session deleted.");
    }
  });
});

export = router;
