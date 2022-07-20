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
router.post("/rpi/image", (req, res) => {
    const reqObj = req.body;
    console.log("---입력값---");
    console.log(`시리얼 번호: ${reqObj.serialNum}`);
    console.log("----------");
    const time = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
    const sql1 = sql_1.default.Register.select_KeyInfo;
    const sql2 = sql_1.default.Image.insert;
    dbconnection_1.default.query(sql1, reqObj.serialNum, (err, result1) => {
        const params2 = [
            reqObj.serialNum,
            time,
            result1[0].KeyState,
            "보안모드: 사진",
            reqObj.image,
        ];
        if (err) {
            res.status(500).json({
                code: 500,
                message: "DB 오류가 발생했습니다.",
            });
            console.log("select KeyState from KeyInfo error");
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
        dbconnection_1.default.query(sql2, params2, (err2) => {
            if (err2) {
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
                message: "사진을 서버에 저장했습니다.",
            });
        });
    });
});
module.exports = router;
