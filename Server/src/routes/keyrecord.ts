/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import { OwnerId, Record, RecordImage } from "../types/type";
import Sql from "../modules/sql";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/main/view_keyrecord", (req, res) => {
  const { serialNum } = req.query;

  console.log("---입력값---");
  console.log(`시리얼번호: ${serialNum}`);
  console.log("---------");

  const sql1: string = Sql.KeyRecord.select_Record;
  const sql2: string = Sql.KeyRecord.select_Authority;

  // check key's authority(whether the login email is the owner)
  connection.query(sql2, serialNum, (err, result1: OwnerId[]) => {
    // check login session
    if (req.session.login === undefined) {
      res.status(404).json({
        code: 404,
        message: "세션이 만료되었습니다. 다시 로그인 해주세요",
      });
      return;
    }
    if (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select error from KeyInfo table");
      console.log(err);
      return;
    }
    if (result1[0].OwnerID !== req.session.login.Email) {
      res.status(400).json({
        code: 404,
        message: "해당 스마트키의 이력이 없습니다.",
      });
      return;
    }
    // select serial number, time, key's state, GPS data,
    // control method, controlled email from KeyRecord DB table
    connection.query(sql1, serialNum, (err2, result2: Record[]) => {
      if (err2) {
        console.log(err);
        res.status(500).json({
          code: 500,
          message: "DB 오류가 발생했습니다.",
        });
        console.log("select error from KeyRecord table");
        console.log(err);
        return;
      }
      if (result2.length === 0) {
        res.status(400).json({
          code: 404,
          message: "해당 스마트키의 이력이 없습니다.",
        });
        return;
      }
      res.status(200).json({
        code: 200,
        message: result2,
      });
    });
  });
});

router.get("/main/view_keyrecord/image", (req, res) => {
  const { serialNum } = req.query;
  const { time } = req.query;

  console.log("---입력값---");
  console.log(`시리얼 번호: ${serialNum}`);
  console.log(`시간 : ${time}`);
  console.log("----------");

  const sql1: string = Sql.KeyRecord.select_Image;
  const params1 = [serialNum, time];
  // check login session
  if (req.session.login === undefined) {
    const resultCode = 404;
    const message = "세션이 만료되었습니다. 다시 로그인 해주세요";
    res.status(resultCode).json({
      code: resultCode,
      message,
    });
  }
  connection.query(sql1, params1, (err, result1: RecordImage[]) => {
    if (err) {
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select error from KeyRecord table");
      console.log(err);
      return;
    }
    if (result1.length === 0) {
      res.status(400).json({
        code: 400,
        message: "존재하지 않는 스마트키입니다",
      });
      return;
    }
    res.status(200).json({
      code: 200,
      message: result1[0].Image,
    });
  });
});

export = router;
