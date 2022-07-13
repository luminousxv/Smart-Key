"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const join_1 = __importDefault(require("./routes/join"));
const login_1 = __importDefault(require("./routes/login"));
// import resetPwRouter from "./routes/resetPW";
const keylist_1 = __importDefault(require("./routes/keylist"));
// import registerkeyRouter from "./routes/register_key";
const delete_key_1 = __importDefault(require("./routes/delete_key"));
// import keyrecordRouter from "./routes/keyrecord";
// import keycontrolRouter from "./routes/keycontrol";
const keyPW_1 = __importDefault(require("./routes/keyPW"));
// import rpiRouter from "./routes/rpi_control";
// import shareRouter from "./routes/keyshare";
// import rpiImageRouter from "./routes/rpi_image";
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
// app.use("/Smart-Key", resetPwRouter);
app.use("/Smart-Key", keylist_1.default);
// app.use("/Smart-Key", registerkeyRouter);
app.use("/Smart-Key", delete_key_1.default);
// app.use("/Smart-Key", keyrecordRouter);
// app.use("/Smart-Key", keycontrolRouter);
app.use("/Smart-Key", keyPW_1.default);
// app.use("/Smart-Key", rpiRouter);
// app.use("/Smart-Key", shareRouter);
// app.use("/Smart-Key", rpiImageRouter);
// Server
app.listen(80, () => {
    /* eslint no-console: ["error", { allow: ["log"] }] */
    console.log("Server On...");
});
