var express = require('express');
var async = require('async');
module.exports = function(esClient){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.post('/wordCloud', function (req, res) {
        console.log(req.body)
        var exclude = ['co','amp','com','go','ga','https']
        var retval = [];
        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'twitter_classify',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "date" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          },
                          "aggs": {
                            "wordcloud": {
                              "terms": {
                                "field": "keywords",
                                "size": 40
                                }
                            }
                          }
                        }
                    };
                    if (req.body.trackerName){
                        if (req.body.trackerName.length>0){
                            body['type'] = req.body.trackerName.join(',');
                        }
                    }
                    //console.log(JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            callback(null,resp.aggregations.wordcloud.buckets);
                        }
                    });
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'bukalapak',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "rdate" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment_bl": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          },
                          "aggs": {
                            "wordcloud": {
                              "terms": {
                                "field": "keywords",
                                "size": 40
                                }
                            }
                          }
                        }
                    };
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            callback(null,resp.aggregations.wordcloud.buckets);
                        }
                    });
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            //console.log(results);
            var r = [];
            for (var i=0;i<results.length;i++){
                for (var j=0;j<results[i].length;j++){
                    r.push(results[i][j])
                }
            }

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
        });

    });
    app.post('/sentiment', function (req, res) {
        console.log(req.body)
        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'twitter_classify',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "date" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          },
                          "aggs": {
                            "sentiment": {
                              "terms": {
                                "field": "sentiment"
                                }
                            }
                          }
                        }
                    };
                    if (req.body.trackerName){
                        if (req.body.trackerName.length>0){
                            body['type'] = req.body.trackerName.join(',');
                        }
                    }
                    //console.log(JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            callback(null,resp.aggregations.sentiment.buckets);
                        }
                    });
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'bukalapak',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "rdate" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment_bl": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          },
                          "aggs": {
                            "sentiment": {
                              "terms": {
                                "field": "sentiment_bl"
                                }
                            }
                          }
                        }
                    };
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(errorSearch);
                            callback(err,'');
                        }
                        else{
                            callback(null,resp.aggregations.sentiment.buckets);
                        }
                    });
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            //console.log('sentiment',results);
            var r = [];
            for (var i=0;i<results.length;i++){
                for (var j=0;j<results[i].length;j++){
                    r.push(results[i][j])
                }
            }
            //console.log(r)
            var s = {neutral:0,negative:0,positive:0}
            for (var i=0;i<r.length;i++){
                if (r[i].key=='neutral') s.neutral+=r[i].doc_count
                else if (r[i].key=='negative') s.negative+=r[i].doc_count
                else if (r[i].key=='positive') s.positive+=r[i].doc_count
            }
            var retval = []
            for (var key in s){
                retval.push({key:key,doc_count:s[key]})
            }
            res.send({type:'success',message:retval})


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
            news:0,
            playstore: 0
        }
        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'twitter_classify',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "date" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          }
                        }
                    };
                    if (req.body.trackerName){
                        if (req.body.trackerName.length>0){
                            body['type'] = req.body.trackerName.join(',');
                        }
                    }
                    //console.log(JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            callback(null,{twitter:resp.hits.total});
                        }
                    });
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'bukalapak',
                        body:{
                          "size":0,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "rdate" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment_bl": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          }
                        }
                    };
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            callback(null,{'news':resp.hits.total});
                        }
                    });
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            console.log('sentiment',results);
            var r = [];
            for (var i=0;i<results.length;i++){
                for (var j=0;j<results[i].length;j++){
                    r.push(results[i][j])
                }
            }
            console.log(r)
            for (var i=0;i<results.length;i++){
                retval[Object.keys(results[i])] = results[i][Object.keys(results[i])]
            }
            res.send({type:'success',message:retval})


        });


    });
    app.post('/timeline', function (req, res) {
        console.log(req.body)
        var exclude = ['co','amp','com','go','ga','https']
        var retval = [];
        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'twitter_classify',
                        body:{
                          "from":req.body.from,
                          "size":req.body.size,
                          "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "date" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          }
                        }
                    };
                    if (req.body.trackerName){
                        if (req.body.trackerName.length>0){
                            body['type'] = req.body.trackerName.join(',');
                        }
                    }
                    //console.log(JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,'');
                        }
                        else{
                            var a = [];
                            for (var i=0;i<resp.hits.hits.length;i++){
                                a.push({
                                    img:resp.hits.hits[i]._source.user.profile_image_url,
                                    user_name: resp.hits.hits[i]._source.user.name,
                                    screen_name: resp.hits.hits[i]._source.user.screen_name,
                                    user_id: resp.hits.hits[i]._source.user.id,
                                    sentiment: resp.hits.hits[i]._source.sentiment,
                                    dt: resp.hits.hits[i]._source.date,
                                    text: resp.hits.hits[i]._source.text,
                                    id: resp.hits.hits[i]._id,
                                    url: 'https://twitter.com/statuses/'+resp.hits.hits[i]._source.id,
                                    source: 'twitter'
                                })
                            }
                            callback(null,a);
                        }
                    });
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    var sentiment = [];
                    if (req.body.sentiment){
                        sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                    }
                    else {
                        sentiment = ['positive','negative','neutral']
                    }

                    var body = {
                        index: 'bukalapak',
                        body:{
                            "from":req.body.from,
                            "size":req.body.size,
                            "query": {
                              "constant_score" : {
                                  "filter" : {
                                      "bool": {
                                          "must": [
                                              {
                                                  "range" : {
                                                      "rdate" : {
                                                          "gte" : req.body.startPeriod+" 00:00:00",
                                                          "lte" : req.body.endPeriod+" 23:59:59"
                                                      }
                                                  }
                                              },
                                              {
                                                  "terms": {
                                                      "sentiment_bl": sentiment
                                                  }
                                              }
                                          ]
                                      }
                                  }
                              }
                          }
                        }
                    };
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(errorSearch);
                            callback(err,'');
                        }
                        else{
                            var a = [];
                            for (var i=0;i<resp.hits.hits.length;i++){
                                a.push({
                                    img: resp.hits.hits[i]._source.seller_avatar,
                                    user_name: resp.hits.hits[i]._source.review.sender_name,
                                    screen_name: resp.hits.hits[i]._source.review.sender_name,
                                    user_id: resp.hits.hits[i]._source.review.sender_id,
                                    sentiment: resp.hits.hits[i]._source.sentiment_bl,
                                    dt: resp.hits.hits[i]._source.rdate,
                                    text: resp.hits.hits[i]._source.review.body,
                                    id: resp.hits.hits[i]._id,
                                    url:resp.hits.hits[i]._source.url,
                                    source:'news'
                                })
                            }
                            callback(null,a);
                        }
                    });
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            //console.log(results);
            var r = [];
            for (var i=0;i<results.length;i++){
                for (var j=0;j<results[i].length;j++){
                    r.push(results[i][j])
                }
            }


            res.send({type:'success',message:r})
        });

    });


    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
