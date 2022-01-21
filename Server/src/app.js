var express  = require('express');
var app = express();

var joinRouter = require('./routes/join');
app.use('/Smart-Key', joinRouter);

var loginRouter = require('./routes/login');
app.use('/Smart-Key', loginRouter);

//Server
var server = app.listen(8080,'localhost', function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("start at http:// %s:%s", host, port);
})