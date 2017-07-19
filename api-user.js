var express = require('express');
var async = require('async');
module.exports = function(esClient,jwt,transporter,mailerConfig){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.post('/account',function (req, res, next) {
        console.log(req.body);
        var body = req.body;
        body['tracker'] = [];
        body['mail_status'] = 1;
        body['token'] = jwt.sign({username:req.body.username}, 'smrai.inc')
        //1=user register,2=mail sent,3=user confirmed

        esClient.exists({
            index: 'user',
            type: 'list',
            id: req.body.username
        }, function (error, exists) {
            if (exists === true) {
                res.send({status:'error',message:'Username already taken'})
            } else {
                esClient.index({
                    index: 'user',
                    type: 'list',
                    id: req.body.username,
                    body: body,
                    refresh: true
                }, function (error2, response) {
                    if (error2) res.send({status:'error',message:'Something went wrong'})
                    else {
                        res.send({status:'success'})
                        var mailOptions = mailerConfig.mail
                        mailOptions.to = body.companyemail;
                        mailOptions.subject = 'Usight.id mail confirmation';
                        mailOptions.html = '<b>Thanks for using Usight, please follow URL bellow to confirm your email</b><br />'+
                            'http://app.usight.id/confirmation?p='+body.token;

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log('error sending email:',error);
                                //res.json({yo: 'error'});
                            }else{
                                console.log('success sent email: ',info.response);
                                //res.json({yo: info.response});
                            };
                        });
                    }
                });
            }
        });
    });
    app.get('/account',function (req, res, next) {
        console.log(req.query);
        var body = req.body;
        body['tracker'] = []

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
                                "should": [{
                                    "term": {
                                        "username": req.query.user
                                    }
                                }, {
                                    "term": {
                                        "companyemail": req.query.user
                                    }
                                }]
                            }
                        }
                    }
                }
            }
        }, function (error, response) {
            if (error){
                res.send({status:'error',message:'Something went wrong'})
            }
            else {
                if(response.hits.total==0){
                    res.send({status:'error',message:'User Not Found'})
                }
                else res.send({status:'success',message:response.hits.hits[0]})
            }
        });
    });
    app.post('/tracker',function (req, res, next) {
        console.log(req.body);
        var body = req.body;
        esClient.search({
            index: 'user',
            type: 'list',
            q: '_id='+req.body.username
        }, function (error, response) {
            if (error) {
                console.log(error)
                res.send({status:'error',message:'Something went wrong'})
            } else {
                if (response.hits.total==0){
                    res.send({status:'error',message:'Empty'})
                }
                else {
                    //console.dir(response.hits.hits)
                    var stats = {}
                    var tracker = response.hits.hits[0]._source.tracker;
                    var stat = true
                    for (var i=0;i<tracker.length;i++){
                        if (tracker[i].trackername == req.body.trackername){
                            stat = false;
                        }
                        else {
                            stat = true

                        }
                    }
                    if (stat == true) tracker.push(req.body)
                    //if (tracker.length==0) tracker.push(req.body)
                    //Set limit
                    if (tracker.length>2) stats = {status:'error',message:'Maximum tracker limit exceded'};
                    var countKeyword = 0;
                    console.log(tracker)
                    for (var i=0;i<tracker.length;i++){
                        if (tracker[i].twitter.mainkeyword.length>0) countKeyword += tracker[i].twitter.mainkeyword.split(',').length
                        if (tracker[i].twitter.requiredkeyword.length>0) countKeyword += tracker[i].twitter.requiredkeyword.split(',').length
                        if (tracker[i].twitter.excludekeyword.length>0) countKeyword += tracker[i].twitter.excludekeyword.split(',').length
                        //console.log(tracker[i].twitter.requiredkeyword.split(',').length)
                    }
                    console.log(countKeyword)
                    if (countKeyword>10) {
                            stats = {status:'error',message:'Maximum keyword limit exceded'};
                    }

                    if (stat == false) stats = {status:'error',message:'Tracker name already exists'};

                    if(Object.keys(stats).length>0) res.send(stats)
                    else if (stat==true){
                        var body = response.hits.hits[0]._source;
                        body['tracker'] = tracker
                        esClient.index({
                            index: 'user',
                            type: 'list',
                            id: req.body.username,
                            body: body,
                            refresh: true
                        }, function (error2, response2) {
                            console.log(error2)
                            if (error2) res.send({status:'error',message:'Something went wrong'})
                            else {
                                res.send({status:'success'})
                            }
                        });
                    }
                }

            }
        });
    });
    app.post('/tracker-edit',function (req, res, next) {
        console.log('tracker-edit',req.body);
        var body = req.body;
        esClient.search({
            index: 'user',
            type: 'list',
            q: '_id='+req.body.username
        }, function (error, response) {
            if (error) {
                console.log(error)
                res.send({status:'error',message:'Something went wrong'})
            } else {
                if (response.hits.total==0){
                    res.send({status:'error',message:'Empty'})
                }
                else {
                    //console.dir(response.hits.hits)
                    var stats = {}
                    var tracker = response.hits.hits[0]._source.tracker;
                    var stat = true
                    for (var i=0;i<tracker.length;i++){
                        if (tracker[i].trackername == req.body.trackername){
                            stat = false;
                            tracker[i]['twitter'] = req.body.twitter
                            tracker[i]['facebook'] = req.body.facebook
                            tracker[i]['modified_date'] = req.body.modified_date
                        }
                        else {
                            stat = true

                        }
                    }
                    //if (stat == true) tracker.push(req.body)
                    //if (tracker.length==0) tracker.push(req.body)
                    //Set limit
                    //if (tracker.length>2) stats = {status:'error',message:'Maximum tracker limit exceded'};
                    var countKeyword = 0;
                    console.log(tracker)
                    for (var i=0;i<tracker.length;i++){
                        if (tracker[i].twitter.mainkeyword.length>0) countKeyword += tracker[i].twitter.mainkeyword.split(',').length
                        if (tracker[i].twitter.requiredkeyword.length>0) countKeyword += tracker[i].twitter.requiredkeyword.split(',').length
                        if (tracker[i].twitter.excludekeyword.length>0) countKeyword += tracker[i].twitter.excludekeyword.split(',').length
                        //console.log(tracker[i].twitter.requiredkeyword.split(',').length)
                    }
                    console.log(countKeyword)
                    if (countKeyword>10) {
                            stats = {status:'error',message:'Maximum keyword limit exceded'};
                    }

                    //if (stat == false) stats = {status:'error',message:'Tracker name already exists'};

                    if(Object.keys(stats).length>0) res.send(stats)
                    else if (stat==false){
                        var body = response.hits.hits[0]._source;
                        body['tracker'] = tracker
                        esClient.index({
                            index: 'user',
                            type: 'list',
                            id: req.body.username,
                            body: body,
                            refresh: true
                        }, function (error2, response2) {
                            console.log(error2)
                            if (error2) res.send({status:'error',message:'Something went wrong'})
                            else {
                                res.send({status:'success'})
                            }
                        });
                    }
                }

            }
        });
    });
    app.post('/tracker-rem',function (req, res, next) {
        console.log('tracker-remove',req.body);
        var body = req.body;
        esClient.search({
            index: 'user',
            type: 'list',
            q: '_id='+req.body.username
        }, function (error, response) {
            if (error) {
                console.log(error)
                res.send({status:'error',message:'Something went wrong'})
            } else {
                if (response.hits.total==0){
                    res.send({status:'error',message:'Empty'})
                }
                else {
                    //console.dir(response.hits.hits)
                    var stats = {}
                    var tracker = response.hits.hits[0]._source.tracker;
                    var tracker2 = []
                    var stat = true
                    for (var i=0;i<tracker.length;i++){
                        if (tracker[i].trackername == req.body.trackername){
                            stat = false;
                        }
                        else {
                            tracker2.push(tracker[i])
                            stat = true

                        }
                    }
                    //if (stat == true) tracker.push(req.body)
                    //if (tracker.length==0) tracker.push(req.body)
                    //Set limit
                    //if (tracker.length>2) stats = {status:'error',message:'Maximum tracker limit exceded'};

                    //if (stat == false) stats = {status:'error',message:'Tracker name already exists'};

                    //if(Object.keys(stats).length>0) res.send(stats)
                    stat = true
                    //else if (stat==true){
                        var body = response.hits.hits[0]._source;
                        body['tracker'] = tracker2
                        esClient.index({
                            index: 'user',
                            type: 'list',
                            id: req.body.username,
                            body: body,
                            refresh:true
                        }, function (error2, response2) {
                            console.log(error2)
                            if (error2) res.send({status:'error',message:'Something went wrong'})
                            else {
                                res.send({status:'success'})
                            }
                        });
                    //}
                }

            }
        });
    });
    app.get('/tracker',function (req, res, next) {
        esClient.search({
            index: 'user',
            type: 'list',
            q: '_id='+req.query.username,
            refresh:true
        }, function (error, response) {
            console.log(response)
            if (error) {
                console.log(error)
                res.send({status:'error',message:'Something went wrong'})
            } else {
                if (response.hits.total==0){
                    res.send({status:'error',message:'Empty'})
                }
                else {
                    //console.dir(response.hits.hits)
                    var stats = {}
                    var tracker = response.hits.hits[0]._source.tracker;
                    res.send({status:'success',message:tracker})
                }

            }
        });
    });
    app.post('/reset-password',function (req, res, next) {
        console.log(req.body);
        var body = req.body;
        //body['tracker'] = [];
        //body['mail_status'] = 1;
        //body['token'] = jwt.sign({username:req.body.username}, 'smrai.inc')
        //1=user register,2=mail sent,3=user confirmed
        var password = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) password += possible.charAt(Math.floor(Math.random() * possible.length));


        esClient.update({
            index: 'user',
            type: 'list',
            id: req.body.username,
            body: {
                // put the partial document under the `doc` key
                doc: {
                    password: password
                }
            }
        }, function (error, response) {
            console.log(error,',',response)
            if(error) res.render('error_404')
            else {
                var mailOptions = mailerConfig.mail
                mailOptions.to = req.body.companyemail;
                mailOptions.subject = 'Usight.id reset password';
                mailOptions.html = '<b>Here are your new account and password:</b><br />'+
                    'account: '+req.body.username+'<br />'+
                    'password: '+password;

                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log('error sending email reset password:',error);
                        //res.json({yo: 'error'});
                    }else{
                        console.log('success sent email reset password: ',info.response);
                        //res.json({yo: info.response});
                    };
                });
            }
        })
    });

    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
