var express = require('express');
var path = require('path');
var logger = require('morgan');
const serveStatic = require('serve-static');
const favicon = require('serve-favicon');
const fs = require('fs');

/**
 * WebSocket Config
 */
const http = require('http');
const WebSocket = require('ws');
const port = 3323

const server = http.createServer(app);
const wss = new WebSocket.Server({ server })
const clients = []

let canvas

wss.on('connection', client => {

    client.send(JSON.stringify(canvas))

    client.on('message', message => {
        console.log('Received message => ' + JSON.parse(message).width + ", " + JSON.parse(message).height)
        canvas = JSON.parse(message)
        clients.forEach(c => {
            if (c !== client) {
                c.send(JSON.stringify(canvas))
            }
        })
    })

    clients.push(client)

    // var interval = setInterval(function(){
    //     data = "Real-Time Update "+number;
    //     console.log("SENT: "+data);
    //     clients.forEach( c => c.send( data ) )
    //     number++;
    // }, randomInteger(2,9)*100);

    client.on('close', function close() {
        // clearInterval(interval);
    });
})

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
//End WebSocket Config

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
const bodyParser = require('body-parser');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

console.log("Adding routers")
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter)
app.use(express.static(path.join(__dirname, 'public'))); //Needs to be at end or you need to change the homepage file to something that's not index.html
app.use(serveStatic('public'));

app.post('/api/sendImage', bodyParser.json(), function (req, res) {
    let img = req.body.img.replace(/^data:image\/png;base64,/, "")
    let buf = Buffer.from(img, 'base64')
    fs.writeFile('./public/canvasState.png', buf, function () {
        console.log('saved file')
        res.send("Got it, boss")
    })
})
module.exports = app;
