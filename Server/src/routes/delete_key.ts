/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import { RequestSerial, OwnerId } from "../types/type";
import Sql from "../modules/sql";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Smart Key Delete API
router.post("/main/delete_key", (req, res) => {
  const { serialNum }: RequestSerial = req.body;
  const sql1: string = Sql.Delete.select;
  const sql2: string = Sql.Delete.update;
  const params2 = ["delete", serialNum];

  console.log("---입력값---");
  console.log(`시리얼번호: ${serialNum}`);
  console.log("----------");

  // check login session
  if (req.session.login === undefined) {
    res.status(404).json({
      code: 404,
      message: "세션이 만료되었습니다. 다시 로그인 하세요.",
    });
    return;
  }
  connection.query(sql1, serialNum, (err, result1: OwnerId[]) => {
    if (err) {
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      console.log("select error from Key_Authority table");
      return;
    }
    if (result1.length === 0) {
      res.status(400).json({
        code: 400,
        message: "해당 스마트키는 등록되지 않았습니다.",
      });
      return;
    }
    if (
      req.session.login !== undefined &&
      result1[0].OwnerID !== req.session.login.Email
    ) {
      res.status(401).json({
        code: 401,
        message: "허가 되지 않은 계정입니다.",
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
        console.log("err");
        return;
      }
      res.status(200).json({
        code: 200,
        message: "스마트키에게 삭제 요청을 보냈습니다. 곧 삭제가 될 것입니다.",
      });
    });
  });
});

export = router;
