/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import moment from "moment";
import connection from "../database/dbconnection";
import { RPIRemote, RequestBluetooth, KeyState } from "../types/type";

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// RPI Remote API
router.get("/rpi/remote", (req, res) => {
  const { serialNum } = req.body;

  console.log("---입력값---");
  console.log(`시리얼 번호: ${serialNum}`);
  console.log("----------");

  const sql1 = "select KeyState, Mode from KeyInfo where SerialNum = ?";
  const sql2 = "delete from KeyInfo where SerialNum = ?";
  const sql3 = "delete from KeyRecord where SerialNum = ?";
  const sql4 = "delete from Key_Authority where SerialNum = ?";
  // get KeyState from KeyInfo DB table
  connection.query(sql1, serialNum, (err, result1: RPIRemote[]) => {
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
        message: "존재하지 않는 스마트키입니다.",
      });
      return;
    }
    // delete key
    if (result1[0].KeyState === "delete") {
      connection.query(sql2, serialNum, (err2) => {
        if (err2) {
          res.status(500).json({
            code: 500,
            message: "DB 오류가 발생했습니다.",
          });
          console.log("delete error from KeyInfo table");
          console.log(err);
          return;
        }
        connection.query(sql3, serialNum, (err3) => {
          if (err3) {
            res.status(500).json({
              code: 500,
              message: "DB 오류가 발생했습니다.",
            });
            console.log("delete error from KeyRecord table");
            console.log(err);
            return;
          }
          connection.query(sql4, serialNum, (err4) => {
            if (err4) {
              res.status(500).json({
                code: 500,
                message: "DB 오류가 발생했습니다.",
              });
              console.log("delete error from Key_Authority table");
              console.log(err);
              return;
            }
            res.status(200).json({
              code: 300,
              state: result1[0].KeyState,
            });
          });
        });
      });
      return;
    }
    res.status(200).json({
      code: 200,
      state: result1[0].KeyState,
      mode: result1[0].Mode,
    });
  });
});

// RPI Bluetooth API
router.post("/rpi/bluetooth", (req, res) => {
  const reqObj: RequestBluetooth = req.body;
  console.log("---입력값---");
  console.log(`시리얼 번호: ${reqObj.serialNum}`);
  console.log(`키 상태: ${reqObj.keyState}`);
  console.log("----------");

  const sql1 = "select KeyState from KeyInfo where SerialNum = ?";
  const sql2 = "update KeyInfo set KeyState = ? where SerialNum = ?";
  const sql3 =
    "insert into KeyRecord (SerialNum, Time, KeyState, Method) values (?, ?, ?, ?)";

  const time = moment().format("YYYY-MM-DD HH:mm:ss");
  const params2 = [reqObj.keyState, reqObj.serialNum];
  const parmas3 = [reqObj.serialNum, time, reqObj.keyState, "블루투스"];

  connection.query(sql1, reqObj.serialNum, (err, result1: KeyState[]) => {
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
        message: "해당 스마트키는 DB에 등록되지 않았습니다.",
      });
      return;
    }
    if (result1[0].KeyState === reqObj.keyState) {
      res.status(400).json({
        code: 400,
        message: `이미 해당 스마트키는 ${reqObj.keyState} 인 상태입니다.`,
      });
      return;
    }
    connection.query(sql2, params2, (err2) => {
      if (err2) {
        res.status(500).json({
          code: 500,
          message: "DB 오류가 발생했습니다.",
        });
        console.log("update error from KeyInfo table");
        console.log(err);
        return;
      }
      connection.query(sql3, parmas3, (err3) => {
        if (err3) {
          res.status(500).json({
            code: 500,
            message: "DB 오류가 발생했습니다.",
          });
          console.log("insert error from KeyRecord table");
          console.log(err);
          return;
        }
        res.status(200).json({
          code: 200,
          message: "블루투스 제어로 인한 이력을 DB에 저장했습니다.",
        });
      });
    });
  });
});

export = router;
