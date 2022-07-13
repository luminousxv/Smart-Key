"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.get("/main/view_keylist", (req, res) => {
    const sql1 = "select SerialNum, KeyName, KeyState, UserID, Shared, Mode from KeyInfo where UserID = ? or SharedID = ?";
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
    dbconnection_1.default.query(sql1, params, (err, result1) => {
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
module.exports = router;
