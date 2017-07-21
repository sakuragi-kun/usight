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
        var source = req.body.source?req.body.source:[];
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
                                          }
                                      }
                                  }
                              },
                              "aggs": {
                                "wordcloud": {
                                  "terms": {
                                    "field": "keywords",
                                    "size": 100
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
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
                                          }
                                      }
                                  }
                              },
                              "aggs": {
                                "wordcloud": {
                                  "terms": {
                                    "field": "keyword",
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
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
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

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
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
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
        };
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }

        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
                                          }
                                      }
                                  }
                              }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
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

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
                                          }
                                      }
                                  }
                              }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
                        //console.log(JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                callback(null,{facebook:resp.hits.total});
                            }
                        });
                    }

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
                                          }
                                      }
                                  }
                              }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
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
                                        source: 'twitter',
                                        total: resp.hits.total
                                    })
                                }
                                callback(null,a);
                            }
                        });
                    }

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
                                          }
                                      }
                                  }
                              }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
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
                                        img:'assets/images/usight/facebook_small.png',
                                        user_name: resp.hits.hits[i]._source.about.name,
                                        screen_name: resp.hits.hits[i]._source.about.name,
                                        user_id: resp.hits.hits[i]._source.about.id,
                                        sentiment: resp.hits.hits[i]._source.sentiment,
                                        dt: resp.hits.hits[i]._source.date,
                                        text: resp.hits.hits[i]._source.post_message,
                                        id: resp.hits.hits[i]._id,
                                        url: 'https://facebook.com/'+resp.hits.hits[i]._source.about.name+'/posts/'+resp.hits.hits[i]._source.post_id,
                                        source: 'facebook',
                                        total: resp.hits.total
                                    })
                                }
                                callback(null,a);
                            }
                        });
                    }

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('news')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                        source:'news',
                                        total: resp.hits.total
                                    })
                                }
                                callback(null,a);
                            }
                        });
                    }

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

    app.post('/buzz', function (req, res) {
        console.log(req.body)
        var retval = {
            facebook:[],
            twitter:[],
            instagram:[],
            news:[],
            playstore: []
        };
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }

        var source = req.body.source?req.body.source:[]
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
                                          }
                                      }
                                  }
                              },
                              "aggs" : {
                                  "data" : {
                                      "date_histogram" : {
                                          "field" : "date",
                                          "interval" : "1d"
                                      },
                                      "aggs": {
                                          "rt": {
                                              "sum": {
                                                  "field": "retweet_count"
                                              }
                                          },
                                          "fav": {
                                              "sum": {
                                                  "field": "favorite_count"
                                              }
                                          },
                                          "total" : {
                                              "value_count" : {
                                                  "field" : "id"
                                              }
                                          }
                                      }
                                  }
                              }

                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
                        //console.log(JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var bt = resp.aggregations.data.buckets;
                                var arr = []
                                for (var i=0;i<bt.length;i++){
                                    arr.push({
                                        dt: bt[i].key_as_string.split(' ')[0],
                                        total: (bt[i].rt.value+bt[i].total.value+bt[i].fav.value)
                                    })
                                }
                                callback(null,{twitter:arr});
                            }
                        });
                    }

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
                                          }
                                      }
                                  }
                              },
                              "aggs" : {
                                    "data" : {
                                        "date_histogram" : {
                                            "field" : "date",
                                            "interval" : "1d"
                                        },
                                        "aggs": {
                                            "total" : {
                                                "value_count" : {
                                                    "field" : "id"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
                        //console.log(JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var bt = resp.aggregations.data.buckets;
                                var arr = []
                                for (var i=0;i<bt.length;i++){
                                    arr.push({
                                        dt: bt[i].key_as_string.split(' ')[0],
                                        total: bt[i].total.value
                                    })
                                }
                                callback(null,{facebook:arr});
                                //callback(null,{facebook:resp.hits.total});
                            }
                        });
                    }

                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            console.log('buzz',results);
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

    app.post('/category', function (req, res) {
        console.log(req.body)
        var retval = {
            other:{positive:0,negative:0,neutral:0},
            informasi: {positive:0,negative:0,neutral:0},
            aplikasi: {positive:0,negative:0,neutral:0},
            fitur: {positive:0,negative:0,neutral:0},
            promosi: {positive:0,negative:0,neutral:0},
            pengiriman: {positive:0,negative:0,neutral:0},
            pembelian: {positive:0,negative:0,neutral:0},
            payment: {positive:0,negative:0,neutral:0}
        }
        var source = req.body.source?req.body.source:[]
        k = []
        k2 = []
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }
        async.parallel([
            function(callback) {
                if (source.indexOf('twitter')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
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
                                              ],
                                              "should": k
                                          }
                                      }
                                  }
                              },
                              "aggs": {
                                    "cat": {
                                      "terms": {
                                        "field": "category"
                                        },
                                        "aggs": {
                                            "sentiment": {
                                              "terms": {
                                                "field": "sentiment"
                                                }
                                            }
                                          }
                                    }
                                }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
                        //console.log(JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var b = resp.aggregations.cat.buckets;
                                var c = {
                                    other:{positive:0,negative:0,neutral:0},
                                    informasi: {positive:0,negative:0,neutral:0},
                                    aplikasi: {positive:0,negative:0,neutral:0},
                                    fitur: {positive:0,negative:0,neutral:0},
                                    promosi: {positive:0,negative:0,neutral:0},
                                    pengiriman: {positive:0,negative:0,neutral:0},
                                    pembelian: {positive:0,negative:0,neutral:0},
                                    payment: {positive:0,negative:0,neutral:0}
                                }
                                for (var i=0;i<b.length;i++){
                                    for (var j=0;j<b[i].sentiment.buckets.length;j++){
                                        c[b[i].key][b[i].sentiment.buckets[j].key] = b[i].sentiment.buckets[j].doc_count;
                                    }
                                }
                                var a = retval;
                                callback(null,c);
                            }
                        });
                    }

                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1){
                    if (k.length==0) callback('nokeyword',[])
                    else {
                        var sentiment = [];
                        if (req.body.sentiment){
                            sentiment = req.body.sentiment.length==0?['positive','negative','neutral']:req.body.sentiment;
                        }
                        else {
                            sentiment = ['positive','negative','neutral']
                        }

                        var body = {
                            index: 'facebook_classify',
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
                                              ],
                                              "should": k2
                                          }
                                      }
                                  }
                              },
                              "aggs": {
                                    "cat": {
                                      "terms": {
                                        "field": "category"
                                        },
                                        "aggs": {
                                            "sentiment": {
                                              "terms": {
                                                "field": "sentiment"
                                                }
                                            }
                                          }
                                    }
                                }
                            }
                        };
                        /*if (req.body.trackerName){
                            if (req.body.trackerName.length>0){
                                body['type'] = req.body.trackerName.join(',');
                            }
                        }*/
                        //console.log(JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var b = resp.aggregations.cat.buckets;
                                console.log('cat fb', JSON.stringify(b,null,2))
                                var c = {
                                    other:{positive:0,negative:0,neutral:0},
                                    informasi: {positive:0,negative:0,neutral:0},
                                    aplikasi: {positive:0,negative:0,neutral:0},
                                    fitur: {positive:0,negative:0,neutral:0},
                                    promosi: {positive:0,negative:0,neutral:0},
                                    pengiriman: {positive:0,negative:0,neutral:0},
                                    pembelian: {positive:0,negative:0,neutral:0},
                                    payment: {positive:0,negative:0,neutral:0}
                                }
                                for (var i=0;i<b.length;i++){
                                    for (var j=0;j<b[i].sentiment.buckets.length;j++){
                                        c[b[i].key][b[i].sentiment.buckets[j].key] = b[i].sentiment.buckets[j].doc_count;
                                    }
                                }
                                var a = retval;
                                callback(null,c);
                            }
                        });
                    }

                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            console.log('category',results);
            var r = [];
            for (var i=0;i<results.length;i++){
                for (var key in results[i]){
                    retval[key].positive = retval[key].positive = results[i][key].positive
                    retval[key].negative = retval[key].negative = results[i][key].negative
                    retval[key].neutral = retval[key].neutral = results[i][key].neutral
                }
            }
            //console.log(r)
            /*var s = {neutral:0,negative:0,positive:0}
            for (var i=0;i<r.length;i++){
                if (r[i].key=='neutral') s.neutral+=r[i].doc_count
                else if (r[i].key=='negative') s.negative+=r[i].doc_count
                else if (r[i].key=='positive') s.positive+=r[i].doc_count
            }
            var retval = []
            for (var key in s){
                retval.push({key:key,doc_count:s[key]})
            }*/
            res.send({type:'success',message:retval})


        });

    });

    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
