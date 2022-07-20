"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const moment_1 = __importDefault(require("moment"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const sql_1 = __importDefault(require("../modules/sql"));
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
// RPI Remote API
router.get("/rpi/remote", (req, res) => {
    const { serialNum } = req.body;
    console.log("---입력값---");
    console.log(`시리얼 번호: ${serialNum}`);
    console.log("----------");
    const sql1 = sql_1.default.RPIControl.select;
    const sql2 = sql_1.default.RPIControl.delete_KeyInfo;
    const sql3 = sql_1.default.RPIControl.delete_Record;
    const sql4 = sql_1.default.RPIControl.delete_Authority;
    // get KeyState from KeyInfo DB table
    dbconnection_1.default.query(sql1, serialNum, (err, result1) => {
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
            dbconnection_1.default.query(sql2, serialNum, (err2) => {
                if (err2) {
                    res.status(500).json({
                        code: 500,
                        message: "DB 오류가 발생했습니다.",
                    });
                    console.log("delete error from KeyInfo table");
                    console.log(err);
                    return;
                }
                dbconnection_1.default.query(sql3, serialNum, (err3) => {
                    if (err3) {
                        res.status(500).json({
                            code: 500,
                            message: "DB 오류가 발생했습니다.",
                        });
                        console.log("delete error from KeyRecord table");
                        console.log(err);
                        return;
                    }
                    dbconnection_1.default.query(sql4, serialNum, (err4) => {
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
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼 번호: ${reqObj.serialNum}`);
    console.log(`키 상태: ${reqObj.keyState}`);
    console.log("----------");
    const sql1 = sql_1.default.Register.select_KeyInfo;
    const sql2 = sql_1.default.RPIControl.update_KeyInfo;
    const sql3 = sql_1.default.RPIControl.insert_Record;
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    const params2 = [reqObj.keyState, reqObj.serialNum];
    const parmas3 = [reqObj.serialNum, time, reqObj.keyState, "블루투스"];
    dbconnection_1.default.query(sql1, reqObj.serialNum, (err, result1) => {
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
        dbconnection_1.default.query(sql2, params2, (err2) => {
            if (err2) {
                res.status(500).json({
                    code: 500,
                    message: "DB 오류가 발생했습니다.",
                });
                console.log("update error from KeyInfo table");
                console.log(err);
                return;
            }
            dbconnection_1.default.query(sql3, parmas3, (err3) => {
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
module.exports = router;
