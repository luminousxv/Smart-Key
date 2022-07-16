"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const join_1 = __importDefault(require("./routes/join"));
const login_1 = __importDefault(require("./routes/login"));
const resetPW_1 = __importDefault(require("./routes/resetPW"));
const keylist_1 = __importDefault(require("./routes/keylist"));
const register_key_1 = __importDefault(require("./routes/register_key"));
const delete_key_1 = __importDefault(require("./routes/delete_key"));
const keyrecord_1 = __importDefault(require("./routes/keyrecord"));
const keycontrol_1 = __importDefault(require("./routes/keycontrol"));
const keyPW_1 = __importDefault(require("./routes/keyPW"));
const rpi_control_1 = __importDefault(require("./routes/rpi_control"));
const keyshare_1 = __importDefault(require("./routes/keyshare"));
const rpi_image_1 = __importDefault(require("./routes/rpi_image"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({
    limit: "50mb",
}));
app.use(body_parser_1.default.urlencoded({
    limit: "50mb",
    extended: true,
}));
app.use("/Smart-Key", join_1.default);
app.use("/Smart-Key", login_1.default);
app.use("/Smart-Key", resetPW_1.default);
app.use("/Smart-Key", keylist_1.default);
app.use("/Smart-Key", register_key_1.default);
app.use("/Smart-Key", delete_key_1.default);
app.use("/Smart-Key", keyrecord_1.default);
app.use("/Smart-Key", keycontrol_1.default);
app.use("/Smart-Key", keyPW_1.default);
app.use("/Smart-Key", rpi_control_1.default);
app.use("/Smart-Key", keyshare_1.default);
app.use("/Smart-Key", rpi_image_1.default);
// Server
app.listen(80, () => {
    /* eslint no-console: ["error", { allow: ["log"] }] */
    console.log("Server On...");
});
