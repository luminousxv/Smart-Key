/* eslint-disable no-console */
import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import { RequestLogin, Users } from "../types/type";
import Sql from "../modules/sql";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileStore = require("session-file-store")(session);

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(
  session({
    secret: "loginsuccess",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: { maxAge: 900000 }, // 15minutes
  })
);

// Login API
router.post("/user/login", (req, res) => {
  const reqObj: RequestLogin = req.body;
  const UserEmail: string = Buffer.from(reqObj.userEmail, "base64").toString(
    "utf-8"
  );
  const UserPwd: string = Buffer.from(reqObj.userPwd, "base64").toString(
    "utf-8"
  );

  console.log("---입력값---");
  console.log(`BASE64 Encoded 이메일: ${reqObj.userEmail}`);
  console.log(`BASE64 Encoded 비밀번호: ${reqObj.userPwd}`);
  console.log(`이메일: ${UserEmail}`);
  console.log(`비밀번호: ${UserPwd}`);
  console.log("----------");

  // Check if account exists
  const sql: string = Sql.Join.select;

  connection.query(sql, UserEmail, (err, result: Users[]) => {
    if (err) {
      console.log("select error from Users table");
      console.log(err);
      res.status(404).json({
        code: 404,
        message: "User DB table error.",
      });
      return;
    }
    if (result.length === 0) {
      console.log("The account does not exist.");
      res.status(400).json({
        code: 400,
        message: "존재하지 않는 계정입니다.",
      });
      return;
    }
    const hashedPw2 = crypto
      .pbkdf2Sync(UserPwd, result[0].Salt, 1, 32, "sha512")
      .toString("base64");
    if (result[0].UserPwd !== hashedPw2) {
      res.status(401).json({
        code: 401,
        message: "비밀번호가 틀렸습니다!",
      });
      return;
    }
    req.session.login = {
      Email: UserEmail,
      Name: result[0].UserName,
    };
    res.status(200).json({
      code: 200,
      message: `로그인 성공! ${result[0].UserName}님 환영합니다!`,
    });
  });
});

export = router;
