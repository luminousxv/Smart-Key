"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_1 = __importDefault(require("crypto"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.post("/main/key_pw", (req, res) => {
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${reqObj.serialNum}`);
    console.log(`스마트키 비밀번호: ${reqObj.smartPwd}`);
    console.log("----------");
    const sql1 = "select SmartPwd, Salt from KeyInfo where SerialNum = ?";
    // check login session
    if (req.session.login === undefined) {
        res.status(404).json({
            code: 404,
            message: "세션이 만료되었습니다. 다시 로그인 해주세요.",
        });
        return;
    }
    // select data from KeyInfo DB table
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
                message: "해당 스마트키가 DB에 존재하지 않습니다. 다시 등록해주세요.",
            });
            return;
        }
        // encrypt input pw with salt save in KeyInfo DB table
        const hashedPw = crypto_1.default
            .pbkdf2Sync(reqObj.smartPwd, result1[0].Salt, 1, 32, "sha512")
            .toString("base64");
        if (hashedPw !== result1[0].SmartPwd) {
            res.status(401).json({
                code: 401,
                message: "스마트키 비밀번호가 틀렸습니다. 다시 입력해주세요",
            });
            return;
        }
        if (hashedPw === result1[0].SmartPwd) {
            res.status(200).json({
                code: 200,
                message: "인증되었습니다.",
            });
        }
    });
});
module.exports = router;
