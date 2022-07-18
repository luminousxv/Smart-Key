/* eslint-disable no-console */
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "../database/dbconnection";
import { KeyList } from "../types/type";
import Sql from "../modules/sql";

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/main/view_keylist", (req, res) => {
  const sql1: string = Sql.List.select;
  // check login session
  if (req.session.login === undefined) {
    res.status(404).json({
      code: 404,
      message: "세션이 만료되었습니다. 다시 로그인 해주세요",
    });
    return;
  }
  const params = [req.session.login.Email, req.session.login.Email];
  // get serial number, key name, key's state(open/close), owner email, shared pending value from KeyInfo DB
  connection.query(sql1, params, (err, result1: KeyList) => {
    if (err) {
      console.log("select error from KeyInfo table");
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "DB 오류가 발생했습니다.",
      });
      return;
    }
    res.status(200).json({
      code: 200,
      message: result1,
    });
  });
});

export = router;
