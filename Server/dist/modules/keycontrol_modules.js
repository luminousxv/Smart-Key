"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyStateCheck = exports.AuthorityCheck = void 0;
function AuthorityCheck(result, err) {
    const response = { code: 0, message: "", flag: false };
    if (result.length === 0) {
        response.code = 400;
        response.message = "존재하지 않는 스마트키입니다.";
        response.flag = true;
        return response;
    }
    if (err) {
        response.code = 500;
        response.message = "DB 오류가 발생했습니다.";
        response.flag = true;
        console.log("Select error in KeyInfo table.");
        console.log(err);
        return response;
    }
    return response;
}
exports.AuthorityCheck = AuthorityCheck;
function KeyStateCheck(result, err, state) {
    const response = { code: 0, message: "", flag: false };
    if (err) {
        response.code = 500;
        response.message = "DB 오류가 발생했습니다.";
        response.flag = true;
        console.log("Select error in KeyInfo table.");
        console.log(err);
        return response;
    }
    if (result[0].KeyState === state) {
        response.code = 400;
        response.message = `스마트키가 이미 ${state}한 상태입니다.`;
        response.flag = true;
        return response;
    }
    return response;
}
exports.KeyStateCheck = KeyStateCheck;
