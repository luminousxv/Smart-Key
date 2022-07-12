/* eslint-disable no-console */
import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import session, { SessionData } from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import GoogleLogin from "../config/google.json";
import { Form, EmailVerification } from "../types/type";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileStore = require("session-file-store")(session);

// Form Checking function
function formSearch(reqdata: Form): boolean {
  if (
    reqdata.pw.length < 8 ||
    reqdata.email.length < 8 ||
    reqdata.name.length < 2 ||
    reqdata.birth.length !== 10
  ) {
    return true;
  }
  return false;
}

const app = express();
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

// Email Configuration
const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: GoogleLogin.user,
    pass: GoogleLogin.pass,
  },
});

// Session Configuration
router.use(
  session({
    secret: "joinsuccess",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: { maxAge: 900000 }, // 15minutes
  })
);

// Join API

router.post("/user/join/email-verification", (req, res) => {
  const reqObj: EmailVerification = req.body;

  console.log("---입력값---");
  console.log(`이메일: ${reqObj.userEmail}`);
  console.log(`비밀번호: ${reqObj.userPwd}`);
  console.log(`이름: ${reqObj.userName}`);
  console.log(`생년월일: ${reqObj.userBirth}`);
  console.log("----------");

  // Repetition Check SQL Query
  const sql2 = "SELECT * FROM Users WHERE UserEmail = ?";
  const form: Form = {
    pw: reqObj.userPwd as string,
    email: reqObj.userEmail as string,
    birth: reqObj.userBirth as string,
    name: reqObj.userName as string,
  };

  connection.query(sql2, reqObj.userEmail, (err, result) => {
    if (err) {
      console.log("select error from Users table");
      console.log(err);
      res.status(404).json({
        code: 404,
        message: "에러가 발생했습니다.",
      });
      return;
    }
    // Form Check
    if (formSearch(form)) {
      res.status(400).json({
        code: 400,
        message: "이메일/이름/비밀번호의 양식이 틀렸습니다. 다시 입력해주세요!",
      });
      return;
    }

    // Sending Verification Email
    if (result.length === 0) {
      // Encryption: using salt as a key to encrypt the password
      const salt = crypto.randomBytes(32).toString("base64");
      const hashedPw = crypto
        .pbkdf2Sync(reqObj.userPwd as string, salt, 1, 32, "sha512")
        .toString("base64");

      // Verification Number
      const authNum = Math.random().toString().substr(2, 6);

      // Define 'user' session
      req.session.user = {
        Email: reqObj.userEmail as string,
        Password: hashedPw,
        Name: reqObj.userName as string,
        Birthday: reqObj.userBirth as string,
        Salt: salt,
        Auth: authNum,
      };

      // Email
      const mailOptions = {
        from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
        to: req.session.user.Email,
        subject: "Smart Key 회원가입 인증 번호 메일입니다.",
        text: `인증번호는 ${authNum} 입니다.`,
      };

      // Send Email
      smtpTransport.sendMail(mailOptions, () => {
        if (err) {
          console.log("Email not sent.");
          console.log(err);
        } else {
          console.log(" Email sent.");
        }
      });

      console.log("----user 세션----");
      console.log(`세션 아이디: ${req.sessionID}`);
      console.log(req.session.user);
      console.log("----------");
      res.status(200).json({
        code: 200,
        message: `${req.session.user.Email} 로 인증 이메일을 보냈습니다. 확인해주세요!`,
      });
      return;
    }

    // Account Exists
    if (reqObj.userEmail === result[0].UserEmail) {
      res.status(400).json({
        code: 400,
        message: "존재하는 회원입니다.",
      });
    }
  });
});

// After verification
router.post("/user/join/join_success", (req, res) => {
  const { inputAuth }: EmailVerification = req.body;
  console.log("---입력값---");
  console.log(`인증번호: ${inputAuth}`);
  console.log("----------");
  console.log("----user 세션----");
  console.log(`세션 아이디: ${req.sessionID}`);
  console.log(req.session.user);
  console.log("----------");

  if (req.session.user === undefined) {
    res.status(404).json({
      code: 404,
      message: "인증번호가 만료 되었습니다. 처음부터 다시 해주세요.",
    });
    return;
  }

  // compare with input and session's verification number
  if (req.session.user !== undefined) {
    if ((inputAuth as string) !== req.session.user.Auth) {
      res.status(400).json({
        code: 400,
        message: "인증번호가 틀렸습니다. 다시 입력 해주세요.",
      });
      return;
    }
    const sql =
      "INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)";
    const params = [
      req.session.user.Email,
      req.session.user.Password,
      req.session.user.Name,
      req.session.user.Birthday,
      req.session.user.Salt,
    ];
    connection.query(sql, params, (err2) => {
      if (err2) {
        console.log("insert error from Users table");
        console.log(err2);
        res.status(404).json({
          code: 404,
          message: "에러가 발생했습니다.",
        });
        return;
      }
      if (!err2) {
        res.status(200).json({
          code: 200,
          message: "회원가입이 되었습니다.",
        });
      }
      // delete session
      if (req.session.user) {
        req.session.destroy((err) => {
          if (err) {
            throw err;
          }
        });
        console.log("User Session deleted.");
      }
    });
  }
});

app.use("/", router);
export = router;
