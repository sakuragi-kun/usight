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
            index: 'twitter_classify,bukalapak',
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
                var searchBody = {
                    index: 'bukalapak',
                    //type: req.body.project,
                    body:{
                      "size":0,
                      "aggs": {
                        "sentiment": {
                          "terms": {
                            "field": "sentiment_bl"
                            }
                        }
                    }
                    }
                }
                if (req.body.project != ''){
                    searchBody['type'] = req.body.project
                }
                esClient.search(searchBody,
                function(err2,resp2){
                    if(err2){
                        res.send({type:'error',message:err2})
                    }
                    else{
                        var r2 = resp2.aggregations.sentiment.buckets;
                        var rSend = [];
                        for (var i=0;i<r.length;i++){
                            for (var j=0;j<r2.length;j++){
                                if (r[i].key == r2[j].key) r[i].doc_count = r[i].doc_count+r2[j].doc_count
                            }
                        }
                        res.send({type:'success',message:r})
                    }
                });
            }
        });
    });
    app.post('/agg_date', function (req, res) {
        console.log(req.body)
        var retval = {facebook:0,twitter:0,instagram:0,news:0}
        var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
                "query": {
                    "range" : {
                        "date" : {
                            "gte" : req.body.start+" 00:00:00",
                            "lte" : req.body.end+" 23:59:59",
                            "boost" : 2.0
                        }
                    }
                },
                "size":0,
                "aggs" : {
                    "agg_date" : {
                        "date_histogram" : {
                            "field" : "date",
                            "interval" : "1d"
                        }
                    }
                }
            }
        }
        if (req.body.project != ''){
            searchBody['type'] = req.body.project
        }
        esClient.search(searchBody,function(err,resp){
            if(err){
                console.log(errorSearch);
                res.send({type:'error',message:err})
            }
            else{
                var r = resp.aggregations.agg_date.buckets;
                retval.twitter = r;
                var searchBody = {
                    index: 'bukalapak',
                    //type: req.body.project,
                    body:{
                        "query": {
                            "range" : {
                                "rdate" : {
                                    "gte" : req.body.start+" 00:00:00",
                                    "lte" : req.body.end+" 23:59:59",
                                    "boost" : 2.0
                                }
                            }
                        },
                        "size":0,
                        "aggs" : {
                            "agg_date" : {
                                "date_histogram" : {
                                    "field" : "rdate",
                                    "interval" : "1d"
                                }
                            }
                        }
                    }
                }
                if (req.body.project != ''){
                    searchBody['type'] = req.body.project
                }
                esClient.search(searchBody,function(err2,resp2){
                    if(err2){

                        res.send({type:'error',message:err2})
                    }
                    else{
                        var r = resp2.aggregations.agg_date.buckets;
                        retval.news = r;
                        res.send({type:'success',message:retval})
                    }
                });
                //res.send({type:'success',message:{twitter:r}})
            }
        });
    });
    app.post('/sums_up', function (req, res) {
        console.log(req.body)
        var retval = {
            facebook:0,
            twitter:0,
            instagram:0,
            news:0
        }
        var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
                "size":0
            }
        }
        if (req.body.project != ''){
            searchBody['type'] = req.body.project
        }
        esClient.search(searchBody,function(err,resp){
            if(err){
                console.log(errorSearch);
                res.send({type:'error',message:err})
            }
            else{
                retval.twitter = resp.hits.total
                var searchBody = {
                    index: 'bukalapak',
                    //type: req.body.project,
                    body:{
                        "size":0
                    }
                }
                if (req.body.project != ''){
                    searchBody['type'] = req.body.project
                }
                esClient.search(searchBody,function(err2,resp2){
                    if(err){
                        console.log(errorSearch);
                        res.send({type:'error',message:err})
                    }
                    else{
                        retval.news = resp2.hits.total
                        res.send({type:'success',message:retval})
                    }
                });
            }
        });
    });



    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
