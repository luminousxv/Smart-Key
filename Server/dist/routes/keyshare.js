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
const sql_1 = __importDefault(require("../modules/sql"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.post("/main/share_key/register", (req, res) => {
    const { serialNum } = req.body;
    const { shareEmail } = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${serialNum}`);
    console.log(`공유할 이메일: ${shareEmail}`);
    console.log("---------");
    const sql1 = sql_1.default.KeyShare.select_Authority;
    const sql2 = sql_1.default.KeyShare.update_KeyInfo;
    const sql3 = sql_1.default.KeyShare.update_Authority;
    const sql4 = sql_1.default.KeyShare.select_User;
    const sql5 = sql_1.default.KeyShare.insert_Record;
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    const params2 = [1, shareEmail, serialNum];
    const params3 = [shareEmail, serialNum];
    dbconnection_1.default.query(sql1, serialNum, (err, result1) => {
        if (req.session.login === undefined) {
            res.status(404).json({
                code: 404,
                message: "세션이 만료되었습니다. 다시 로그인 해주세요",
            });
            return;
        }
        const params5 = [
            serialNum,
            time,
            `${shareEmail} 에게 공유`,
            req.session.login.Email,
        ];
        if (err) {
            res.status(500).json({
                code: 500,
                message: "DB 오류가 발생했습니다.",
            });
            console.log("select error from Key_Authority table");
            console.log(err);
            return;
        }
        if (result1.length === 0) {
            res.status(404).json({
                code: 404,
                message: "해당 스마트키가 존재하지 않습니다.",
            });
            return;
        }
        if (result1[0].ShareID != null) {
            res.status(400).json({
                code: 400,
                message: "이미 공유 받은 계정이 존재합니다.",
            });
            return;
        }
        if (result1[0].OwnerID !== req.session.login.Email) {
            res.status(401).json({
                code: 400,
                message: "허가 받지 않는 계정입니다.",
            });
            return;
        }
        dbconnection_1.default.query(sql4, shareEmail, (err2, result4) => {
            if (err2) {
                res.status(500).json({
                    code: 500,
                    message: "DB 오류가 발생했습니다.",
                });
                console.log("select error from User table");
                console.log(err);
                return;
            }
            if (result4.length === 0) {
                res.status(400).json({
                    code: 400,
                    message: "공유 받을 계정이 존재하지 않습니다.",
                });
                return;
            }
            dbconnection_1.default.query(sql2, params2, (err3) => {
                if (err3) {
                    res.status(500).json({
                        code: 500,
                        message: "DB 오류가 발생했습니다.",
                    });
                    console.log("update error from KeyInfo table");
                    console.log(err);
                    return;
                }
                dbconnection_1.default.query(sql3, params3, (err4) => {
                    if (err4) {
                        res.status(500).json({
                            code: 500,
                            message: "DB 오류가 발생했습니다.",
                        });
                        console.log("update error from Key_Authority table");
                        console.log(err);
                        return;
                    }
                    dbconnection_1.default.query(sql5, params5, (err5) => {
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
                            message: "공유가 완료 되었습니다.",
                        });
                    });
                });
            });
        });
    });
});
router.post("/main/share_key/delete", (req, res) => {
    const { serialNum } = req.body;
    console.log("---입력값---");
    console.log(`시리얼번호: ${serialNum}`);
    console.log("---------");
    const sql1 = sql_1.default.KeyShare.select_Authority;
    const sql2 = sql_1.default.KeyShare.update_Authority;
    const sql3 = sql_1.default.KeyShare.update_KeyInfo;
    const sql4 = sql_1.default.KeyShare.insert_Record;
    const params2 = [null, serialNum];
    const params3 = [0, null, serialNum];
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    dbconnection_1.default.query(sql1, serialNum, (err, result1) => {
        if (req.session.login === undefined) {
            res.status(404).json({
                code: 404,
                message: "세션이 만료되었습니다. 다시 로그인 해주세요",
            });
            return;
        }
        const params4 = [serialNum, time, "공유 삭제", req.session.login.Email];
        if (err) {
            console.log(err);
            res.status(500).json({
                code: 500,
                message: "DB 오류가 발생했습니다.",
            });
            console.log("select error from Key_Authority table");
            console.log(err);
            return;
        }
        if (result1.length === 0) {
            res.status(400).json({
                code: 400,
                message: "해당 스마트키가 존재하지 않습니다.",
            });
            return;
        }
        if (result1[0].OwnerID !== req.session.login.Email) {
            res.status(401).json({
                code: 401,
                message: "허가 받지 않은 계정입니다.",
            });
            return;
        }
        if (result1[0].ShareID == null) {
            res.status(400).json({
                code: 400,
                message: "공유 받은 계정이 존재하지 않습니다.",
            });
            return;
        }
        dbconnection_1.default.query(sql2, params2, (err2) => {
            if (err2) {
                console.log(err);
                res.status(500).json({
                    code: 500,
                    message: "DB 오류가 발생했습니다.",
                });
                console.log("update error from Key_Authority table");
                console.log(err);
                return;
            }
            dbconnection_1.default.query(sql3, params3, (err3) => {
                if (err3) {
                    console.log(err);
                    res.status(500).json({
                        code: 500,
                        message: "DB 오류가 발생했습니다.",
                    });
                    console.log("update error from KeyInfo table");
                    console.log(err);
                    return;
                }
                dbconnection_1.default.query(sql4, params4, (err4) => {
                    if (err4) {
                        console.log(err);
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
                        message: "공유 계정을 삭제했습니다.",
                    });
                });
            });
        });
    });
});
module.exports = router;
