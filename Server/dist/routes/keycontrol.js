"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const moment_1 = __importDefault(require("moment"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const keycontrol_modules_1 = require("../modules/keycontrol_modules");
const sql_1 = __importDefault(require("../modules/sql"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
// Smart Key Remote Open API
router.post("/main/open_key", (req, res) => {
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${reqObj.serialNum}`);
    console.log(`GPS Longitude: ${reqObj.GPSLong}`);
    console.log(`GPS Latitude: ${reqObj.GPSLat}`);
    console.log("----------");
    const sql = sql_1.default.KeyControl;
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    const params = ["open", reqObj.serialNum];
    // check authority
    dbconnection_1.default.query(sql.select_Authority, reqObj.serialNum, (err, result5) => {
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
        let moduleResponse = (0, keycontrol_modules_1.AuthorityCheck)(result5, err);
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
        if (result5[0].OwnerID === req.session.login.Email ||
            result5[0].ShareID === req.session.login.Email) {
            // get Smart Key from KeyInfo DB table
            dbconnection_1.default.query(sql.select_Info, reqObj.serialNum, (err2, result1) => {
                moduleResponse = (0, keycontrol_modules_1.AuthorityCheck)(result1, err2);
                if (moduleResponse.flag) {
                    res.status(moduleResponse.code).json({
                        code: moduleResponse.code,
                        message: moduleResponse.message,
                    });
                    return;
                }
                // check Smart Key's state(open/close)
                dbconnection_1.default.query(sql.select_State, reqObj.serialNum, (err3, result4) => {
                    moduleResponse = (0, keycontrol_modules_1.KeyStateCheck)(result4, err3, "open");
                    if (moduleResponse.flag) {
                        res.status(moduleResponse.code).json({
                            code: moduleResponse.code,
                            message: moduleResponse.message,
                        });
                        return;
                    }
                    // change Smart Key's state(close -> open) from KeyInfo DB table
                    dbconnection_1.default.query(sql.update_Info, params, (err4) => {
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
                        dbconnection_1.default.query(sql.insert_Record, params2, (err5) => {
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
                });
            });
        }
    });
});
// Smart Key Remote Close API
router.post("/main/close_key", (req, res) => {
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${reqObj.serialNum}`);
    console.log(`GPS Longitude: ${reqObj.GPSLong}`);
    console.log(`GPS Latitude: ${reqObj.GPSLat}`);
    console.log("----------");
    const sql = sql_1.default.KeyControl;
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    const params = ["open", reqObj.serialNum];
    // check authority
    dbconnection_1.default.query(sql.select_Authority, reqObj.serialNum, (err, result5) => {
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
        let moduleResponse = (0, keycontrol_modules_1.AuthorityCheck)(result5, err);
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
        if (result5[0].OwnerID === req.session.login.Email ||
            result5[0].ShareID === req.session.login.Email) {
            // get Smart Key from KeyInfo DB table
            dbconnection_1.default.query(sql.select_Info, reqObj.serialNum, (err2, result1) => {
                moduleResponse = (0, keycontrol_modules_1.AuthorityCheck)(result1, err2);
                if (moduleResponse.flag) {
                    res.status(moduleResponse.code).json({
                        code: moduleResponse.code,
                        message: moduleResponse.message,
                    });
                    return;
                }
                // check Smart Key's state(open/close)
                dbconnection_1.default.query(sql.select_State, reqObj.serialNum, (err3, result4) => {
                    moduleResponse = (0, keycontrol_modules_1.KeyStateCheck)(result4, err3, "close");
                    if (moduleResponse.flag) {
                        res.status(moduleResponse.code).json({
                            code: moduleResponse.code,
                            message: moduleResponse.message,
                        });
                        return;
                    }
                    // change Smart Key's state(close -> open) from KeyInfo DB table
                    dbconnection_1.default.query(sql.update_Info, params, (err4) => {
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
                        dbconnection_1.default.query(sql.insert_Record, params2, (err5) => {
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
                });
            });
        }
    });
});
router.post("/main/mode", (req, res) => {
    const { serialNum } = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${serialNum}`);
    console.log("----------");
    const sql1 = sql_1.default.Mode.select;
    const sql2 = sql_1.default.Mode.update;
    const time = new Date(+new Date() + 3240 * 10000)
        .toISOString()
        .replace("T", " ")
        .replace(/\..*/, "");
    const sql3 = "insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)";
    let params2 = [1, serialNum];
    // check login session
    dbconnection_1.default.query(sql1, serialNum, (err, result1) => {
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
            dbconnection_1.default.query(sql2, params2, (err2) => {
                if (err2) {
                    res.status(500).json({
                        code: 500,
                        message: "DB 오류가 발생했습니다.",
                    });
                    console.log("update Mode from KeyInfo error");
                    console.log(err);
                    return;
                }
                dbconnection_1.default.query(sql3, params3, (err3) => {
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
        dbconnection_1.default.query(sql2, params2, (err4) => {
            if (err4) {
                res.status(500).json({
                    code: 500,
                    message: "DB 오류가 발생했습니다.",
                });
                console.log("update Mode from KeyInfo error");
                console.log(err);
                return;
            }
            dbconnection_1.default.query(sql3, params4, (err5) => {
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
module.exports = router;
