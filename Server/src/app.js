const express  = require('express');
const app = express();
let bodyParser = require("body-parser");

app.use(bodyParser.json({
    limit: "50mb"
}));
app.use(bodyParser.urlencoded({ 
    limit: "50mb",
    extended: true
}));

let joinRouter = require('./routes/join');
app.use('/Smart-Key', joinRouter);

let loginRouter = require('./routes/login');
app.use('/Smart-Key', loginRouter);

let resetPwRouter = require('./routes/resetPW');
app.use('/Smart-Key', resetPwRouter);

let keylistRouter = require('./routes/keylist');
app.use('/Smart-Key', keylistRouter);

let registerkeyRouter = require('./routes/register_key');
app.use('/Smart-Key', registerkeyRouter);

let deletekeyRouter = require('./routes/delete_key');
app.use('/Smart-Key', deletekeyRouter);

let keyrecordRouter = require('./routes/keyrecord');
app.use('/Smart-Key', keyrecordRouter)

let keycontrolRouter = require('./routes/keycontrol');
app.use('/Smart-Key', keycontrolRouter);

let keyPwdRouter = require('./routes/keyPW');
app.use('/Smart-Key', keyPwdRouter);

let rpiRouter = require('./routes/rpi_control');
app.use('/Smart-Key', rpiRouter);

let shareRouter = require('./routes/keyshare');
app.use('/Smart-Key', shareRouter);

let rpiImageRouter = require('./routes/rpi_image');
app.use('/Smart-Key', rpiImageRouter);

//Server
let server = app.listen(80, function(){
    console.log('Server on...')
})