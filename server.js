'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cluster = require('cluster');
var elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
  host: '128.199.88.206:7200'
  //log: 'trace'
});

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
    var api = require('./api')(esClient);
    var apiSentiment = require('./api-sentiment')(esClient);

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });
    app.use('/api', api);
    app.use('/api-sentiment', apiSentiment);

    app.get('/', function (req, res) {
        res.render('login');
    });
    app.get('/index', function (req, res) {
        res.render('home');
    });
    app.post('/login', function (req, res) {
        var usr = [
            {user:'aldi',password:'telkom123'},
            {user:'test',password:'test'}
        ]
        var stat = false;
        for (var i=0;i<usr.length;i++){
            if (usr[i].user == req.body.username && usr[i].password==req.body.password){
                stat = true
            }
        }
        if (stat == true) res.send({status:'success'})
        else res.send({status:'error'})
    });
	app.get('/login', function (req, res) {
        res.render('login');
    });
    app.get('/home', function (req, res) {
        res.render('home');
    });
    app.get('/sentiment', function (req, res) {
        res.render('sentiment');
    });
    app.get('/engagement', function (req, res) {
        res.render('engagement');
    });
    app.get('/tracker', function (req, res) {
        res.render('tracker');
    });
    app.get('/tracker-add', function (req, res) {
        res.render('tracker-add');
    });
    app.get('/404', function (req, res) {
        res.render('error_404');
    });


    app.listen(80, function () {
      console.log('Prototype app listening on port 1500!');
    });
}
