"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({
    extended: true,
}));
// Register Key API
router.post("/main/register_key", (req, res) => {
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${reqObj.serialNum}`);
    console.log(`스마트키 이름: ${reqObj.keyName}`);
    console.log(`스마트키 비밀번호: ${reqObj.smartPwd}`);
    console.log("----------");
    const sql1 = "select KeyState from KeyInfo where SerialNum = ?";
    const sql2 = "insert into KeyInfo (SerialNum, KeyName, KeyState, UserID, SmartPwd, Salt, Shared, Mode) values (?, ?, ?, ?, ?, ?, ?, ?)";
    const sql3 = "insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)";
    const sql4 = "insert into Key_Authority(SerialNum, OwnerID) values (?, ?)";
    const salt = crypto_1.default.randomBytes(32).toString("base64");
    const hashedPw = crypto_1.default
        .pbkdf2Sync(reqObj.smartPwd, salt, 1, 32, "sha512")
        .toString("base64");
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    // check login session
    if (req.session.login === undefined) {
        res.status(404).json({
            code: 404,
            message: "세션이 만료되었습니다. 다시 로그인 하세요.",
        });
        return;
    }
    const params = [
        reqObj.serialNum,
        reqObj.keyName,
        "open",
        req.session.login.Email,
        hashedPw,
        salt,
        0,
        0,
    ];
    const params2 = [
        reqObj.serialNum,
        time,
        "open",
        "처음 등록",
        req.session.login.Email,
    ];
    const parmas3 = [reqObj.serialNum, req.session.login.Email];
    // check KeyInfo DB table if key is registered
    dbconnection_1.default.query(sql1, reqObj.serialNum, (err, result) => {
        if (err) {
            res.status(500).json({
                code: 500,
                message: "DB 오류가 발생했습니다.",
            });
            console.log("select error from KeyInfo table");
            console.log("err");
            return;
        }
        if (result.length !== 0) {
            res.status(400).json({
                code: 400,
                message: "등록하려는 키는 이미 등록이 되어있습니다.",
            });
            return;
        }
        // insert key's data to KeyInfo DB table
        dbconnection_1.default.query(sql2, params, (err2) => {
            if (err2) {
                res.status(500).json({
                    code: 500,
                    message: "DB 오류가 발생했습니다.",
                });
                console.log("insert error from KeyInfo table");
                console.log(err);
                return;
            }
            // insert key record to KeyRecord DB table
            dbconnection_1.default.query(sql3, params2, (err3) => {
                if (err3) {
                    res.status(500).json({
                        code: 500,
                        message: "DB 오류가 발생했습니다.",
                    });
                    console.log("insert error from KeyRecord table");
                    console.log(err);
                    return;
                }
                // insert owner's email to Key_Authority DB table
                dbconnection_1.default.query(sql4, parmas3, (err4) => {
                    if (err4) {
                        res.status(500).json({
                            code: 500,
                            message: "DB 오류가 발생했습니다.",
                        });
                        console.log("insert error from Key_Authority table");
                        console.log(err);
                        return;
                    }
                    res.status(200).json({
                        code: 200,
                        message: `새로운 Smart Key "${reqObj.keyName}" 이(가) 등록되었습니다.`,
                    });
                });
            });
        });
    });
});
module.exports = router;
