var express = require('express');
module.exports = function(esClient){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
        /*if (req.path == '/authenticate'){
            req.username = req.body.username
            next();
        }
        else {
            var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
            var sqlstr = 'select count(1) '+
            'from user a, role_user b,role_menu c, menu d '+
            'where a.id = b.user_id and b.role_id = c.role_id '+
            'and c.menu_id = d.id '+
            'and a.name = "'+user.username+'" '+
            'and a.password = "'+user.password+'" '+
            'and d.state = "'+req.headers.state+'"';

            connection(sqlstr, undefined,function(err, rows, fields) {
                if (err){
                    res.status(500).send({error:'unavailable'})
                }
                else if(rows.length==0){
                    res.status(404).send({error:'failed authentication'})
                }
                else {
                    req.username = user.username
                    next();
                }
            });
        }*/
    });

    app.post('/wordCloud', function (req, res) {
        console.log(req.body)
        var exclude = ['co','amp','com','go','ga','https']
        var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
              "size":0,
              "aggs": {
                "wordcloud": {
                  "terms": {
                    "field": "keywords",
                    "size": req.body.total
                    }
                }
            }
            }
        }
        if (req.body.project != ''){
            searchBody['type'] = req.body.project
        }
        esClient.search(searchBody,
        function(err,resp){
            if(err){
                console.log(errorSearch);
                res.send({type:'error',message:err})
            }
            else{
                var r = resp.aggregations.wordcloud.buckets;
                var r2 = [], r3 = [];
                var rSend = {};
                var max = req.body.max;
                var m = 0;
                for (var i=0;i<r.length;i++){

                    if (r[i].key.indexOf('http')>-1){
                        r3.push(r[i])
                    }
                    if (exclude.indexOf(r[i].key)>-1){
                        r3.push(r[i])
                    }
                    else if(r[i].key.length == 1){
                        r3.push(r[i])
                    }
                    else if(isNaN(r[i].key) == false){
                        r3.push(r[i])
                    }
                    else {
                        if (m==0) m=r[i].doc_count
                        r2.push(r[i])
                    }
                }
                for (var i=0;i<r2.length;i++){
                    r2[i].size = Math.round(r2[i].doc_count/m*max)
                    rSend[r2[i].key] = r2[i].size
                }


                res.send({type:'success',message:rSend})
            }
        });
    });
    app.post('/sentiment', function (req, res) {
        console.log(req.body)
        var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
              "size":0,
              "aggs": {
                "sentiment": {
                  "terms": {
                    "field": "sentiment"
                    }
                }
            }
            }
        }
        if (req.body.project != ''){
            searchBody['type'] = req.body.project
        }
        esClient.search(searchBody,
        function(err,resp){
            if(err){
                console.log(errorSearch);
                res.send({type:'error',message:err})
            }
            else{
                var r = resp.aggregations.sentiment.buckets;
                res.send({type:'success',message:r})
            }
        });
    });



    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
