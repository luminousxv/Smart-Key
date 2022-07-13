/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import { RequestKey, KeyPwd } from "../types/type";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/main/key_pw", (req, res) => {
  const reqObj: RequestKey = req.body;

  console.log("---입력값---");
  console.log(`시리얼번호: ${reqObj.serialNum}`);
  console.log(`스마트키 비밀번호: ${reqObj.smartPwd}`);
  console.log("----------");

  const sql1 = "select SmartPwd, Salt from KeyInfo where SerialNum = ?";
  // check login session
  if (req.session.login === undefined) {
    res.status(404).json({
      code: 404,
      message: "세션이 만료되었습니다. 다시 로그인 해주세요.",
    });
    return;
  }
  // select data from KeyInfo DB table
  connection.query(sql1, reqObj.serialNum, (err, result1: KeyPwd[]) => {
    if (err) {
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select error from KeyInfo table");
      console.log(err);
      return;
    }
    if (result1.length === 0) {
      res.status(400).json({
        code: 400,
        message: "해당 스마트키가 DB에 존재하지 않습니다. 다시 등록해주세요.",
      });
      return;
    }
    // encrypt input pw with salt save in KeyInfo DB table
    const hashedPw = crypto
      .pbkdf2Sync(reqObj.smartPwd, result1[0].Salt, 1, 32, "sha512")
      .toString("base64");
    if (hashedPw !== result1[0].SmartPwd) {
      res.status(401).json({
        code: 401,
        message: "스마트키 비밀번호가 틀렸습니다. 다시 입력해주세요",
      });
      return;
    }
    if (hashedPw === result1[0].SmartPwd) {
      res.status(200).json({
        code: 200,
        message: "인증되었습니다.",
      });
    }
  });
});

export = router;
