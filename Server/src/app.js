const express  = require('express');
const app = express();

let joinRouter = require('./routes/join');
app.use('/Smart-Key', joinRouter);

let loginRouter = require('./routes/login');
app.use('/Smart-Key', loginRouter);

let resetPwRouter = require('./routes/resetPW');
app.use('/Smart-Key', resetPwRouter);

//Server
let server = app.listen(8080,'localhost', function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})