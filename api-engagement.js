var express = require('express');
var async = require('async');
module.exports = function(esClient){
    var app = express.Router();

    app.use(function (req, res, next) {
        next();
    });

    app.post('/graph', function (req, res) {
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
                              "aggs" : {
                                    "agg_date" : {
                                        "date_histogram" : {
                                            "field" : "date",
                                            "interval" : "1d"
                                        },
                                        "aggs": {
                                            "rt" : {
                                                "sum" : {
                                                    "field" : "retweet_count"
                                                }
                                            },
                                            "fav" : {
                                                "sum" : {
                                                    "field" : "favorite_count"
                                                }
                                            },
                                            "reply" : { "value_count" : { "field" : "in_reply_to_status_id" } },
                                            "share" : {
                                                "filter" : { "term": { "retweeted": true} }
                                            },
                                            "like" : {
                                                "filter" : { "term": { "favorited": true} }
                                            },
                                            "follower" : {
                                                "sum" : {
                                                    "field" : "user.followers_count"
                                                }
                                            },
                                            "distinct_user" : {
                                                "cardinality" : {
                                                  "field" : "user.name"
                                                }
                                            }
                                        }
                                    }


                                }
                            }
                        };
                        //console.log('eng',JSON.stringify(body,null,2))
                        esClient.search(body,
                        function(err,resp){
                            //console.log('eng',resp)
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var a = resp.aggregations.agg_date.buckets;
                                var r = []
                                for (var i=0;i<a.length;i++){
                                    r.push({
                                        date:a[i].key_as_string.split(' ')[0],
                                        total: (a[i].rt.value + a[i].fav.value + a[i].reply.value + a[i].like.doc_count + a[i].share.doc_count),
                                        follower: Math.round(a[i].follower.value/a[i].distinct_user.value)
                                    })
                                }
                                retval.twitter = r
                                callback(null,r);
                            }
                        });
                    }
                }
                else callback(null, []);
            },
            function(callback) {
                if (source.indexOf('facebook')>-1 && req.body.fb.length>0){
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
                              "aggs" : {
                                    "agg_date" : {
                                        "date_histogram" : {
                                            "field" : "date",
                                            "interval" : "1d"
                                        }
                                    }
                                }
                            }
                        };
                        console.log('GRAPH',JSON.stringify(body,null,2))
                        //body.body.query.constant_score.filter.bool.must.push(k2)
                        esClient.search(body,
                        function(err,resp){
                            if(err){
                                console.log(err);
                                callback(err,'');
                            }
                            else{
                                var a = resp.aggregations.agg_date.buckets;
                                var r = []
                                for (var i=0;i<a.length;i++){
                                    r.push({
                                        date:a[i].key_as_string.split(' ')[0],
                                        total: a[i].doc_count,
                                        follower: 1
                                    })
                                }
                                retval.facebook = r
                                callback(null,r);
                            }
                        });
                    }
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            //console.log(results);

            res.send({type:'success',message:retval})
        });

    });
    app.post('/source', function (req, res) {
        var exclude = ['co','amp','com','go','ga','https']
        var retval = {
            post: 0,
            link: 0,
            image: 0,
            video: 0
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
                k2.push({
                    "term": {
                        "keyword": req.body.keywords.split(',')[i].trim()
                    }
                })
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
                                    "media": {
                                      "terms": {
                                        "field": "entities.media.type"
                                        }
                                    },
                                    "link" : {
                                        "filter" : { "exists" : { "field" : "entities.urls.url" } },
                                        "aggs" : { "total" : { "value_count" : { "field" : "entities.urls.url" } }}
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
                                var a = resp.aggregations;
                                var r = {
                                    post: resp.hits.total,
                                    link: resp.aggregations.link.total.value,
                                    image: 0,
                                    video: 0
                                };
                                for (var i=0;i<a.media.buckets.length;i++){
                                    r.image += a.media.buckets[i].doc_count
                                }
                                callback(null,r);
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
                                var r = {
                                    post: resp.hits.total,
                                    link: 0,
                                    image: 0,
                                    video: 0
                                };

                                callback(null,r);
                            }
                        });
                    }
                }
                else callback(null, []);
            }
        ],
        function(err, results) {
            //console.log(results);
            for (var i=0;i<results.length;i++){
                retval.post += results[i].post
                retval.link += results[i].link
                retval.image += results[i].image
                retval.video += results[i].video
            }

            res.send({type:'success',message:retval})
        });

    });
    app.post('/top10', function (req, res) {
        //console.log('word-cloud',req.body)
        var exclude = ['co','amp','com','go','ga','https']
        var d1 = new Date();
        var d2=  new Date();
        d2.setDate(d2.getDate() - 14);
        d1s = [
            d1.getFullYear(),
            ('0' + (d1.getMonth() + 1)).slice(-2),
            ('0' + d1.getDate()).slice(-2)
        ].join('-')
        d2s = [
            d2.getFullYear(),
            ('0' + (d2.getMonth() + 1)).slice(-2),
            ('0' + d2.getDate()).slice(-2)
        ].join('-');
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
                if (k.length==0) callback('nokeyword',[])
                else {
                    var sentiment = [];
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
                                "top_tags": {
                                    "terms": {
                                        "field": "user.screen_name",
                                        "size": 10
                                    },
                                    "aggs": {
                                        "top_sales_hits": {
                                            "top_hits": {
                                                "sort": [
                                                    {
                                                        "user.followers_count": {
                                                            "order": "desc"
                                                        }
                                                    }
                                                ],
                                                "_source": {
                                                    "includes": [ "user.id", "user.followers_count","user.screen_name","user.profile_image_url" ]
                                                },
                                                "size" : 1
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };

                    //console.log('top10',JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,[]);
                        }
                        else{
                            var s = [];

                            var a = resp.aggregations.top_tags.buckets;
                            for (var i=0;i<a.length;i++){
                                for(var j=0;j<a[i].top_sales_hits.hits.hits.length;j++){
                                    s.push({
                                        id:a[i].top_sales_hits.hits.hits[j]._source.user.id,
                                        name:a[i].top_sales_hits.hits.hits[j]._source.user.name,
                                        screen_name:a[i].top_sales_hits.hits.hits[j]._source.user.screen_name,
                                        friends_count:a[i].top_sales_hits.hits.hits[j]._source.user.friends_count,
                                        image: a[i].top_sales_hits.hits.hits[j]._source.user.profile_image_url
                                    })
                                }
                            }
                            /*for (var i=0;i<resp.hits.hits.length;i++){
                                s.push({
                                    id:resp.hits.hits[i]._source.user.id,
                                    name:resp.hits.hits[i]._source.user.name,
                                    screen_name:resp.hits.hits[i]._source.user.screen_name,
                                    friends_count:resp.hits.hits[i]._source.user.friends_count,
                                    image: resp.hits.hits[i]._source.user.profile_image_url
                                })
                            }*/
                            callback(null,s);
                        }
                    });
                }


            },
            function(callback) {
                callback(null,[]);
                /*if (k.length==0) callback('nokeyword',[])
                else{
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
                                                          "gte" : d2s+" 00:00:00",
                                                          "lte" : d1s+" 23:59:59"
                                                      }
                                                  }
                                              }
                                          ],
                                          "should": k
                                      }
                                  }
                              }
                          },
                          "sort": [
                               {
                                 "user.friends_count": {
                                   "order": "desc"
                                 }
                               }
                          ]
                        }
                    };
                    //console.log(JSON.stringify(body,null,2))
                    esClient.search(body,
                    function(err,resp){
                        if(err){
                            console.log(err);
                            callback(err,[]);
                        }
                        else{
                            var s = [];
                            for (var i=0;i<resp.hits.hits.length;i++){
                                s.push({
                                    id:resp.hits.hits[i].user.id,
                                    name:resp.hits.hits[i].user.name,
                                    screen_name:resp.hits.hits[i].user.screen_name,
                                    friends_count:resp.hits.hits[i].user.friends_count
                                })
                            }
                            callback(null,s);
                        }
                    });
                }*/
            }
        ],
        function(err, results) {
            //console.log(results);
            var a = [];
            for (var i=0;i<results.length;i++){
                for (var j=0;j<results[i].length;j++){
                    a.push(results[i][j])
                }
            }

            res.send({type:'success',message:a})
        });

        /*var searchBody = {
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
                console.log(err);
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
        });*/
    });


    return app;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
