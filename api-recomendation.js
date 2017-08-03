var express = require('express');
var async = require('async');
module.exports = function(esClient){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.post('/recomendation', function (req, res) {
        var exclude = ['co','amp','com','go','ga','https']
        var retval = {
            twitter: [],
            facebook: [],
            instagram: [],
            news: [],
            playstore: []
        };
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
                /*k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })*/
            }
        }
        if (req.body.fb.length>0){
            for(var i=0;i<req.body.fb.split(',').length;i++){
                k2.push({
                    "term": {
                        "about.name": req.body.fb.split(',')[i].trim().toLowerCase()
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
                                                          "sentiment": ["positive","negative","neutral"]
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
                                            "field": "recomendation2",
                                            "size": 150
                                        }
                                    }
                                }
                            }
                        };
                        console.log('eng',JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            console.log('eng',resp)
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var a = resp.aggregations.cat.buckets;
                                var o = {}

                                for (var i=0;i<a.length;i++){
                                    if (a[i].key.indexOf('|')>-1){
                                        if (o[a[i].key.split('|')[0]]){
                                            o[a[i].key.split('|')[0]].push({
                                                key: a[i].key.split('|')[1],
                                                doc_count: a[i].doc_count
                                            })
                                        }
                                        else {
                                            o[a[i].key.split('|')[0]] = [{
                                                key: a[i].key.split('|')[1],
                                                doc_count: a[i].doc_count
                                            }]
                                        }
                                    }

                                    //o[a[i].key.split('|')] = a[i].rec.buckets;
                                }
                                //retval.twitter = r
                                callback(null,o);
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
                                                          "sentiment": ["positive","negative","neutral"]
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
                                            "field": "recomendation2",
                                            "size": 50
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
                                var a = resp.aggregations.cat.buckets;
                                var o = {}
                                for (var i=0;i<a.length;i++){
                                    if (a[i].key.indexOf('|')>-1){
                                        if (o[a[i].key.split('|')[0]]){
                                            o[a[i].key.split('|')[0]].push({
                                                key: a[i].key.split('|')[1],
                                                doc_count: a[i].doc_count
                                            })
                                        }
                                        else {
                                            o[a[i].key.split('|')[0]] = [{
                                                key: a[i].key.split('|')[1],
                                                doc_count: a[i].doc_count
                                            }]
                                        }
                                    }

                                    //o[a[i].key.split('|')] = a[i].rec.buckets;
                                }
                                //retval.twitter = r
                                callback(null,o);
                            }
                        });
                    }
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            console.log(results);
            var r = {};
            for (var i=0;i<results.length;i++){
                for (var key in results[i]){
                    if (!r[key]){
                        r[key] = results[i][key]
                    }
                    else {
                        for (var j=0;j<results[i][key].length;j++){
                            r[key].push(results[i][key][j])
                        }
                    }
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
