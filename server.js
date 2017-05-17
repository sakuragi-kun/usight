'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cluster = require('cluster');

if (cluster.isMaster) {
    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
}
else {
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(bodyParser.json()); // support json encoded bodies
    app.use('/assets', express.static(__dirname + '/assets'));
    app.set('views', __dirname + '/template' );
    app.set('view engine', 'ejs');

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });

	app.get('/', function (req, res) {
        res.render('home');
    });
	app.get('/login', function (req, res) {
        res.render('login');
    });
	app.get('/home', function (req, res) {
        res.render('home');
    });


    app.listen(1500, function () {
      console.log('Prototype app listening on port 1500!');
    });
}
