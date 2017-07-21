var express = require('express'), async = require('async');
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
        //console.log(req.body.keywords)
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
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
                          "aggs": {
                            "wordcloud": {
                              "terms": {
                                "field": "keywords",
                                "size": req.body.total
                                }
                            }
                          }
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
                            callback(null,resp.aggregations.wordcloud.buckets);
                        }
                    });
                }


            },
            function(callback) {
                if (k.length==0) callback('nokeyword',[])
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
                          "aggs": {
                            "wordcloud": {
                              "terms": {
                                "field": "keywords",
                                "size": req.body.total
                                }
                            }
                          }
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
                            callback(null,resp.aggregations.wordcloud.buckets);
                        }
                    });
                }

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
        ///console.log(req.body);
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
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
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
                          "aggs": {
                            "sentiment": {
                              "terms": {
                                "field": "sentiment"
                                }
                            }
                          }
                        }
                    };
                    //console.log('sentiment',JSON.stringify(body,null,2))
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


            },
            function(callback) {
                if (k.length==0) callback('nokeyword',[])
                else {
                    var sentiment = [];

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
                          "aggs": {
                            "sentiment": {
                              "terms": {
                                "field": "sentiment"
                                }
                            }
                          }
                        }
                    };
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
        console.log('aggdate',req.body)
        var retval = {facebook:0,twitter:0,instagram:0,news:0};
        k = []
        console.log(req.body.keywords)
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                console.log('kk',req.body.keywords.split(',')[i])
                //console.log('kk2',req.body.keywords.split(',')[i].trim)
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }

        var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
                "query": {
                    "constant_score" : {
                        "filter" : {
                            "bool": {
                                "must": [
                                    {
                                        "range" : {
                                            "date" : {
                                                "gte" : req.body.start+" 00:00:00",
                                                "lte" : req.body.end+" 23:59:59"
                                            }
                                        }
                                    }
                                ],
                                "should": k
                            }
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
        if (k.length==0) res.send({type:'error',message:'No Keyword'})
        else {
            esClient.search(searchBody,function(err,resp){
                if(err){
                    console.log(err);
                    res.send({type:'error',message:err})
                }
                else{
                    var r = resp.aggregations.agg_date.buckets;
                    retval.twitter = r;
                    var searchBody = {
                        index: 'facebook_classify',
                        //type: req.body.project,
                        body:{
                            "query": {
                                "constant_score" : {
                                    "filter" : {
                                        "bool": {
                                            "must": [
                                                {
                                                    "range" : {
                                                        "date" : {
                                                            "gte" : req.body.start+" 00:00:00",
                                                            "lte" : req.body.end+" 23:59:59"
                                                        }
                                                    }
                                                }
                                            ],
                                            "should": k
                                        }
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
                    esClient.search(searchBody,function(err2,resp2){
                        if(err2){

                            res.send({type:'error',message:err2})
                        }
                        else{
                            var r = resp2.aggregations.agg_date.buckets;
                            retval.facebook = r;
                            res.send({type:'success',message:retval})
                        }
                    });
                    //res.send({type:'success',message:{twitter:r}})
                }
            });
        }
    });
    app.post('/sums_up', function (req, res) {
        console.log(req.body)
        var retval = {
            facebook:0,
            twitter:0,
            instagram:0,
            news:0
        }
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
        //console.log(req.body.keywords)
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
                    }
                })
            }
        }

        var searchBody = {
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
              }
            }
        };

        /*var searchBody = {
            index: 'twitter_classify',
            //type: req.body.project,
            body:{
                "size":0
            }
        }*/
        if (req.body.project != ''){
            searchBody['type'] = req.body.project
        }
        if (k.length==0) res.send({type:'error',message:'No Keyword'})
        else {
            console.log('############MASUK ELSE',k)
            esClient.search(searchBody,function(err,resp){
                if(err){
                    console.log(err);
                    res.send({type:'error',message:err})
                }
                else{
                    retval.twitter = resp.hits.total
                    var searchBody = {
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
                          }
                        }
                    };
                    /*var searchBody = {
                        index: 'bukalapak',
                        //type: req.body.project,
                        body:{
                            "size":0
                        }
                    }*/
                    if (req.body.project != ''){
                        searchBody['type'] = req.body.project
                    }
                    esClient.search(searchBody,function(err2,resp2){
                        if(err2){
                            console.log(err2);
                            res.send({type:'error',message:err})
                        }
                        else{
                            retval.facebook = resp2.hits.total
                            res.send({type:'success',message:retval})
                        }
                    });
                }
            });

        }

    });
    app.post('/top5', function (req, res) {
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
        //console.log(req.body.keywords)
        if (req.body.keywords.length>0){
            for(var i=0;i<req.body.keywords.split(',').length;i++){
                k.push({
                    "term": {
                        "keywords": req.body.keywords.split(',')[i].trim()
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
                          "aggs": {
                                "top_tags": {
                                    "terms": {
                                        "field": "user.screen_name",
                                        "size": 5
                                    },
                                    "aggs": {
                                        "top_sales_hits": {
                                            "top_hits": {
                                                "sort": [
                                                    {
                                                        "user.friends_count": {
                                                            "order": "desc"
                                                        }
                                                    }
                                                ],
                                                "_source": {
                                                    "includes": [ "user.id", "user.friends_count","user.screen_name","user.profile_image_url" ]
                                                },
                                                "size" : 1
                                            }
                                        }
                                    }
                                }
                            }
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
                            console.log(resp.aggregations.top_tags.buckets)
                            console.log(resp.hits.hits)

                            var a = resp.aggregations.top_tags.buckets;
                            console.log('a',JSON.stringify(a,null,2));
                            for (var i=0;i<a.length;i++){
                                for(var j=0;j<a[i].top_sales_hits.hits.hits.length;j++){
                                    console.log(a[i].top_sales_hits.hits.hits[j])
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
            console.log(results)
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
