/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import moment from "moment";
import connection from "../database/dbconnection";
import { RequestImage, KeyState } from "../types/type";

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/rpi/image", (req, res) => {
  const reqObj: RequestImage = req.body;

  console.log("---입력값---");
  console.log(`시리얼 번호: ${reqObj.serialNum}`);
  console.log("----------");

  const time = moment().format("YYYY-MM-DD HH:mm:ss");
  const sql1 = "select KeyState from KeyInfo where SerialNum = ?";
  const sql2 =
    "insert into KeyRecord (SerialNum, Time, KeyState, Method, Image) values (?, ?, ?, ?, ?)";

  connection.query(sql1, reqObj.serialNum, (err, result1: KeyState[]) => {
    const params2 = [
      reqObj.serialNum,
      time,
      result1[0].KeyState,
      "보안모드: 사진",
      reqObj.image,
    ];
    if (err) {
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select KeyState from KeyInfo error");
      console.log(err);
      return;
    }
    if (result1.length === 0) {
      res.status(400).json({
        code: 400,
        message: "존재하지 않는 스마트키입니다.",
      });
      return;
    }
    connection.query(sql2, params2, (err2) => {
      if (err2) {
        res.status(500).json({
          code: 500,
          message: "DB 오류가 발생했습니다.",
        });
        console.log("insert into KeyRecord error");
        console.log(err);
        return;
      }
      res.status(200).json({
        code: 200,
        message: "사진을 서버에 저장했습니다.",
      });
    });
  });
});

export = router;
