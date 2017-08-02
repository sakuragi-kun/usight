'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cluster = require('cluster');
var elasticsearch = require('elasticsearch'), fs = require('fs'), request = require('request');
const esClient = new elasticsearch.Client({
  //host: '128.199.88.206:7200'
  host: 'localhost:7200'
  //log: 'trace'
});
var sendmail = require('sendmail')();
var nodemailer = require('nodemailer');
var mailerConfig = JSON.parse(fs.readFileSync(__dirname+'/mailerConfig.json','utf-8'));

if (cluster.isMaster) {
    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
}
else {
    var transporter = nodemailer.createTransport(mailerConfig.smtp);
    var jwt = require('jsonwebtoken');
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(bodyParser.json()); // support json encoded bodies
    app.use('/assets', express.static(__dirname + '/assets'));
    app.set('views', __dirname + '/template' );
    app.set('view engine', 'ejs');
    var api = require('./api')(esClient);
    var apiSentiment = require('./api-sentiment')(esClient);
    var apiEngagement = require('./api-engagement')(esClient);
    var apiRecomendation = require('./api-recomendation')(esClient);
    var apiUser = require('./api-user')(esClient,jwt,transporter,mailerConfig);

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });
    app.use('/api', api);
    app.use('/user', apiUser);
    app.use('/api-sentiment', apiSentiment);
    app.use('/api-engagement', apiEngagement);
    app.use('/api-recomendation', apiRecomendation);

    app.get('/', function (req, res) {
        res.render('login');
    });
    app.get('/index', function (req, res) {
        res.render('home');
    });
    app.get('/coming-soon', function (req, res) {
        res.render('coming_soon');
    });
    app.get('/confirmation', function (req, res) {
        //confirmation?p=hashValue
        try{
            console.log(req.query);
            var user = jwt.verify(req.query.p, 'smrai.inc');
            console.log(user);
            //if ok, render confirmation page, else render 404 page
            esClient.exists({
                index: 'user',
                type: 'list',
                id: user.username
            }, function (error, exists) {
                console.log(exists)
                if (exists === true) {
                    esClient.update({
                        index: 'user',
                        type: 'list',
                        id: user.username,
                        body: {
                            // put the partial document under the `doc` key
                            doc: {
                                mail_status: 3
                            }
                        }
                    }, function (error, response) {
                        if(error) res.render('error_404')
                        else {
                            res.render('confirm');
                        }
                    })
                    //res.send({status:'error',message:'Username already taken'})
                }
                else {
                    res.render('error_404')
                }
            });

        }
        catch(e){
            res.render('error_404')
        }

    });
    app.post('/login', function (req, res) {
        esClient.search({
            index: 'user',
            type: 'list',
            body: {
                query:{
                    "filtered": {
                        "query": {
                            "match_all": {}
                        },
                        "filter": {
                            "bool": {
                                "must": [{
                                    "term": {
                                        "username": req.body.username
                                    }
                                }, {
                                    "term": {
                                        "password": req.body.password
                                    }
                                }]
                            }
                        }
                    }
                }
            }
        }, function (error, response) {
            console.dir(response)
            if (error){
                res.send({status:'error',message:'Invalid login'})
            }
            else {
                if(response.hits.total==0){
                    res.send({status:'error',message:'User Not Found'})
                }
                else res.send({status:'success',message:response.hits.hits[0]})
            }
        });
        /*var usr = [
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
        else res.send({status:'error'})*/
    });
    app.get('/login', function (req, res) {
        res.render('login');
    });
    app.get('/forgot-password', function (req, res) {
        res.render('forgot_password');
    });
    app.get('/account', function (req, res) {
        res.render('create_account');
    });
    app.get('/account_success', function (req, res) {
        res.render('create_account_success');
    });
    app.get('/home', function (req, res) {
        res.render('home');
    });
    app.get('/sentiment', function (req, res) {
        res.render('sentiment');
    });
    app.get('/recomendation', function (req, res) {
        res.render('recomendation');
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
    app.get('/sendMail', function (req, res) {
        /*sendmail({
            from: 'no-reply@usight.id',
            to: 'danuyanpermadi@gmail.com',
            subject: 'test sendmail',
            html: 'Mail of test sendmail ',
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
            res.send({msg:reply,error:err})
        });*/
        /*var mailOptions = mailerConfig.mail
        mailOptions.to = 'danu@alutechno.io';
        mailOptions.subject = 'Email Example';
        mailOptions.html = '<b>Hello world ✔</b>';

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                res.json({yo: 'error'});
            }else{
                console.log('Message sent: ' + info.response);
                res.json({yo: info.response});
            };
        });*/
        var options = {
            method: 'POST',
            url: 'https://helio.id/apilogin',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data'
            },
            formData:{
                username: 'info',
                password: 'info123',
                domains: 'usight.id',
                token: '12123123123123123123'
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
            var b = {}
            try{
                b = JSON.parse(body)
            }catch(e){
                res.send({status:'error',message:e})
            }
            if (b.code==200){
                console.log('success login,',b.data.token)
                var options2 = {
                    method: 'POST',
                    url: 'https://helio.id/composemobile',
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data'
                    },
                    formData:{
                        token: b.data.token,
                        to: 'danuyanpermadi@gmail.com',
                        subject: 'usight.id testing',
                        body: '12123123123123123123'
                    }
                };
                console.log('options2',options2)

                request(options2, function (error2, response2, body2) {
                    console.log('error2',error2)
                    console.log('body2',body2)
                    if (error2) throw new Error(error2);

                    console.log(body2);
                    res.send(body2);

                });
            }
        });

    });


    app.listen(80, function () {
      console.log('Prototype app listening on port 1500!');
    });
}
