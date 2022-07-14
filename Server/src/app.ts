import bodyParser from "body-parser";
import express from "express";
import joinRouter from "./routes/join";
import loginRouter from "./routes/login";
// import resetPwRouter from "./routes/resetPW";
import keylistRouter from "./routes/keylist";
// import registerkeyRouter from "./routes/register_key";
import deletekeyRouter from "./routes/delete_key";
// import keyrecordRouter from "./routes/keyrecord";
import keycontrolRouter from "./routes/keycontrol";
import keyPwdRouter from "./routes/keyPW";
// import rpiRouter from "./routes/rpi_control";
// import shareRouter from "./routes/keyshare";
// import rpiImageRouter from "./routes/rpi_image";

const app = express();

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use("/Smart-Key", joinRouter);
app.use("/Smart-Key", loginRouter);
// app.use("/Smart-Key", resetPwRouter);
app.use("/Smart-Key", keylistRouter);
// app.use("/Smart-Key", registerkeyRouter);
app.use("/Smart-Key", deletekeyRouter);
// app.use("/Smart-Key", keyrecordRouter);
app.use("/Smart-Key", keycontrolRouter);
app.use("/Smart-Key", keyPwdRouter);
// app.use("/Smart-Key", rpiRouter);
// app.use("/Smart-Key", shareRouter);
// app.use("/Smart-Key", rpiImageRouter);

// Server
app.listen(80, () => {
  /* eslint no-console: ["error", { allow: ["log"] }] */
  console.log("Server On...");
});
