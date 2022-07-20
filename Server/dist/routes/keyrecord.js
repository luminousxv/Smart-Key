"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const sql_1 = __importDefault(require("../modules/sql"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.get("/main/view_keyrecord", (req, res) => {
    const { serialNum } = req.query;
    console.log("---입력값---");
    console.log(`시리얼번호: ${serialNum}`);
    console.log("---------");
    const sql1 = sql_1.default.KeyRecord.select_Record;
    const sql2 = sql_1.default.KeyRecord.select_Authority;
    // check key's authority(whether the login email is the owner)
    dbconnection_1.default.query(sql2, serialNum, (err, result1) => {
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
        dbconnection_1.default.query(sql1, serialNum, (err2, result2) => {
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
    const sql1 = sql_1.default.KeyRecord.select_Image;
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
    dbconnection_1.default.query(sql1, params1, (err, result1) => {
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
module.exports = router;
