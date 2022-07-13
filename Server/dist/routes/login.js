"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconnection_1 = __importDefault(require("../database/dbconnection"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileStore = require("session-file-store")(express_session_1.default);
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.use(body_parser_1.default.json());
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.use((0, express_session_1.default)({
    secret: "loginsuccess",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: { maxAge: 900000 }, // 15minutes
}));
// Login API
router.post("/user/login", (req, res) => {
    const reqObj = req.body;
    const UserEmail = Buffer.from(reqObj.userEmail, "base64").toString("utf-8");
    const UserPwd = Buffer.from(reqObj.userPwd, "base64").toString("utf-8");
    console.log("---입력값---");
    console.log(`BASE64 Encoded 이메일: ${reqObj.userEmail}`);
    console.log(`BASE64 Encoded 비밀번호: ${reqObj.userPwd}`);
    console.log(`이메일: ${UserEmail}`);
    console.log(`비밀번호: ${UserPwd}`);
    console.log("----------");
    // Check if account exists
    const sql = "SELECT * FROM Users WHERE UserEmail = ?";
    dbconnection_1.default.query(sql, UserEmail, (err, result) => {
        if (err) {
            console.log("select error from Users table");
            console.log(err);
            res.status(404).json({
                code: 404,
                message: "User DB table error.",
            });
            return;
        }
        if (result.length === 0) {
            console.log("The account does not exist.");
            res.status(400).json({
                code: 400,
                message: "존재하지 않는 계정입니다.",
            });
            return;
        }
        const hashedPw2 = crypto_1.default
            .pbkdf2Sync(UserPwd, result[0].Salt, 1, 32, "sha512")
            .toString("base64");
        if (result[0].UserPwd !== hashedPw2) {
            res.status(401).json({
                code: 401,
                message: "비밀번호가 틀렸습니다!",
            });
            return;
        }
        req.session.login = {
            Email: UserEmail,
            Name: result[0].UserName,
        };
        res.status(200).json({
            code: 200,
            message: `로그인 성공! ${result[0].UserName}님 환영합니다!`,
        });
    });
});
module.exports = router;
