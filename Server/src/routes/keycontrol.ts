/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import moment from "moment";
import { MysqlError } from "mysql";
import connection from "../database/dbconnection";
import { RequestGPS, ModuleReturn, KeyAuthority, KeyInfo } from "../types/type";
import { AuthorityCheck, KeyStateCheck } from "../modules/keycontrol_modules";
import Sql from "../modules/sql";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Smart Key Remote Open API
router.post("/main/open_key", (req, res) => {
  const reqObj: RequestGPS = req.body;

  console.log("---입력값---");
  console.log(`시리얼번호: ${reqObj.serialNum}`);
  console.log(`GPS Longitude: ${reqObj.GPSLong}`);
  console.log(`GPS Latitude: ${reqObj.GPSLat}`);
  console.log("----------");

  const sql = Sql.KeyControl;

  const time = moment().format("YYYY-MM-DD HH:mm:ss");
  const params = ["open", reqObj.serialNum];

  // check authority
  connection.query(
    sql.select_Authority,
    reqObj.serialNum,
    (err, result5: KeyAuthority[]) => {
      // check login session
      if (req.session.login === undefined) {
        res.status(404).json({
          code: 404,
          message: "세션이 만료되었습니다. 다시 로그인 해주세요",
        });
        return;
      }
      const params2 = [
        reqObj.serialNum,
        time,
        "open",
        reqObj.GPSLat,
        reqObj.GPSLong,
        "원격",
        req.session.login.Email,
      ];
      let moduleResponse: ModuleReturn = AuthorityCheck(
        result5,
        err as MysqlError
      );
      if (moduleResponse.flag) {
        res.status(moduleResponse.code).json({
          code: moduleResponse.code,
          message: moduleResponse.message,
        });
        if (moduleResponse.code === 500) {
          console.log("Select error in Key_Authority table.");
          console.log(err);
        }
        return;
      }
      if (
        result5[0].OwnerID === req.session.login.Email ||
        result5[0].ShareID === req.session.login.Email
      ) {
        // get Smart Key from KeyInfo DB table
        connection.query(
          sql.select_Info,
          reqObj.serialNum,
          (err2, result1: KeyInfo[]) => {
            moduleResponse = AuthorityCheck(result1, err2 as MysqlError);
            if (moduleResponse.flag) {
              res.status(moduleResponse.code).json({
                code: moduleResponse.code,
                message: moduleResponse.message,
              });
              return;
            }
            // check Smart Key's state(open/close)
            connection.query(
              sql.select_State,
              reqObj.serialNum,
              (err3, result4) => {
                moduleResponse = KeyStateCheck(
                  result4,
                  err3 as MysqlError,
                  "open"
                );
                if (moduleResponse.flag) {
                  res.status(moduleResponse.code).json({
                    code: moduleResponse.code,
                    message: moduleResponse.message,
                  });
                  return;
                }
                // change Smart Key's state(close -> open) from KeyInfo DB table
                connection.query(sql.update_Info, params, (err4) => {
                  if (err4) {
                    res.status(500).json({
                      code: 500,
                      message: "DB 오류가 발생했습니다.",
                    });
                    console.log("update error from KeyInfo table");
                    console.log(err);
                    return;
                  }
                  // add Smart Key's record to KeyRecord DB table
                  connection.query(sql.insert_Record, params2, (err5) => {
                    if (err5) {
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
                      message: "스마트키가 열렸습니다.",
                    });
                  });
                });
              }
            );
          }
        );
      }
    }
  );
});

// Smart Key Remote Close API
router.post("/main/close_key", (req, res) => {
  const reqObj: RequestGPS = req.body;

  console.log("---입력값---");
  console.log(`시리얼번호: ${reqObj.serialNum}`);
  console.log(`GPS Longitude: ${reqObj.GPSLong}`);
  console.log(`GPS Latitude: ${reqObj.GPSLat}`);
  console.log("----------");

  const sql = Sql.KeyControl;

  const time = moment().format("YYYY-MM-DD HH:mm:ss");
  const params = ["open", reqObj.serialNum];

  // check authority
  connection.query(
    sql.select_Authority,
    reqObj.serialNum,
    (err, result5: KeyAuthority[]) => {
      // check login session
      if (req.session.login === undefined) {
        res.status(404).json({
          code: 404,
          message: "세션이 만료되었습니다. 다시 로그인 해주세요",
        });
        return;
      }
      const params2 = [
        reqObj.serialNum,
        time,
        "close",
        reqObj.GPSLat,
        reqObj.GPSLong,
        "원격",
        req.session.login.Email,
      ];
      let moduleResponse: ModuleReturn = AuthorityCheck(
        result5,
        err as MysqlError
      );
      if (moduleResponse.flag) {
        res.status(moduleResponse.code).json({
          code: moduleResponse.code,
          message: moduleResponse.message,
        });
        if (moduleResponse.code === 500) {
          console.log("Select error in Key_Authority table.");
          console.log(err);
        }
        return;
      }
      if (
        result5[0].OwnerID === req.session.login.Email ||
        result5[0].ShareID === req.session.login.Email
      ) {
        // get Smart Key from KeyInfo DB table
        connection.query(
          sql.select_Info,
          reqObj.serialNum,
          (err2, result1: KeyInfo[]) => {
            moduleResponse = AuthorityCheck(result1, err2 as MysqlError);
            if (moduleResponse.flag) {
              res.status(moduleResponse.code).json({
                code: moduleResponse.code,
                message: moduleResponse.message,
              });
              return;
            }
            // check Smart Key's state(open/close)
            connection.query(
              sql.select_State,
              reqObj.serialNum,
              (err3, result4) => {
                moduleResponse = KeyStateCheck(
                  result4,
                  err3 as MysqlError,
                  "close"
                );
                if (moduleResponse.flag) {
                  res.status(moduleResponse.code).json({
                    code: moduleResponse.code,
                    message: moduleResponse.message,
                  });
                  return;
                }
                // change Smart Key's state(close -> open) from KeyInfo DB table
                connection.query(sql.update_Info, params, (err4) => {
                  if (err4) {
                    res.status(500).json({
                      code: 500,
                      message: "DB 오류가 발생했습니다.",
                    });
                    console.log("update error from KeyInfo table");
                    console.log(err);
                    return;
                  }
                  // add Smart Key's record to KeyRecord DB table
                  connection.query(sql.insert_Record, params2, (err5) => {
                    if (err5) {
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
                      message: "스마트키가 닫혔습니다.",
                    });
                  });
                });
              }
            );
          }
        );
      }
    }
  );
});

router.post("/main/mode", (req, res) => {
  const { serialNum } = req.body;

  console.log("---입력값---");
  console.log(`시리얼번호: ${serialNum}`);
  console.log("----------");

  const sql1: string = Sql.Mode.select;
  const sql2: string = Sql.Mode.update;
  const time = new Date(+new Date() + 3240 * 10000)
    .toISOString()
    .replace("T", " ")
    .replace(/\..*/, "");
  const sql3 =
    "insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)";
  let params2 = [1, serialNum];

  // check login session
  connection.query(sql1, serialNum, (err, result1) => {
    if (req.session.login === undefined) {
      res.status(404).json({
        code: 404,
        message: "세션이 만료되었습니다. 다시 로그인 해주세요",
      });
      return;
    }
    if (err) {
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select KeyState, Mode from KeyInfo error");
      console.log(err);
      return;
    }
    const params3 = [
      serialNum,
      time,
      result1[0].KeyState,
      "보안모드로 변경",
      req.session.login.Email,
    ];
    const params4 = [
      serialNum,
      time,
      result1[0].KeyState,
      "일반모드로 변경",
      req.session.login.Email,
    ];
    if (result1[0].Mode === 0) {
      connection.query(sql2, params2, (err2) => {
        if (err2) {
          res.status(500).json({
            code: 500,
            message: "DB 오류가 발생했습니다.",
          });
          console.log("update Mode from KeyInfo error");
          console.log(err);
          return;
        }
        connection.query(sql3, params3, (err3) => {
          if (err3) {
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
            message: "스마트키가 보안모드로 변경되었습니다.",
          });
        });
      });
      return;
    }
    params2 = [0, serialNum];
    connection.query(sql2, params2, (err4) => {
      if (err4) {
        res.status(500).json({
          code: 500,
          message: "DB 오류가 발생했습니다.",
        });
        console.log("update Mode from KeyInfo error");
        console.log(err);
        return;
      }
      connection.query(sql3, params4, (err5) => {
        if (err5) {
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
          message: "스마트키가 일반모드로 변경되었습니다.",
        });
      });
    });
  });
});

export = router;
