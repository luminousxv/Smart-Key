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
// Smart Key Delete API
router.post("/main/delete_key", (req, res) => {
    const { serialNum } = req.body;
    const sql1 = sql_1.default.Delete.select;
    const sql2 = sql_1.default.Delete.update;
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
    dbconnection_1.default.query(sql1, serialNum, (err, result1) => {
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
        if (req.session.login !== undefined &&
            result1[0].OwnerID !== req.session.login.Email) {
            res.status(401).json({
                code: 401,
                message: "허가 되지 않은 계정입니다.",
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
module.exports = router;
