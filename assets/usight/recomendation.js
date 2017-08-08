/* ------------------------------------------------------------------------------
 *
 *  # Dashboard configuration
 *
 *  Demo dashboard configuration. Contains charts and plugin inits
 *
 *  Version: 1.0
 *  Latest update: Aug 1, 2015
 *
 * ---------------------------------------------------------------------------- */

$(function() {
    var api = localStorage.publicApi;

    var trackerName = [];
    var fbAccount = '';
    var startPeriod = moment().subtract('days', 6).format('YYYY-MM-DD'), endPeriod = moment().format('YYYY-MM-DD');
    var source = [];
    var sentiment = [];
    var from = 0, size = 10;
    var a = JSON.parse(localStorage.getItem('usight-tracker'));
    var aa = []
    for (var i=0;i<a.length;i++){
        aa.push('<option value="'+a[i].trackername+'">'+a[i].trackername+'</option>');
    }
    $('#listTracker').html(aa.join(' '));

    var keyword = []
    var tracker = JSON.parse(localStorage.getItem('usight-tracker'))
    console.log('tw1',tracker)

    try{
        for (var i=0;i<tracker.length;i++){
            for (var j=0;j<tracker[i].twitter.mainkeyword.split(',').length;j++){
                try{
                    if (tracker[i].twitter.mainkeyword.split(',')[j].length>0) keyword.push(tracker[i].twitter.mainkeyword.split(',')[j])
                }
                catch(e){}
            }
        }
        //keyword = JSON.parse(localStorage.getItem('usight-tracker')).twitter.mainkeyword
    }
    catch(e){}
    var ff = []
    try{
        for (var i=0;i<tracker.length;i++){
            console.log('sendBody3',tracker[i].facebook)
            ff.push(tracker[i].facebook['facebookid'])

        }
        //keyword = JSON.parse(localStorage.getItem('usight-tracker')).twitter.mainkeyword
    }
    catch(e){}
    fbAccount = ff.join(',')

    console.log('tw2',keyword)
    console.log('period',$('#period').html())

    function setAllSource(ch){
        if (ch){
            $('#sourcetwitter').prop('checked',true);
            $('#sourcetwitter').parent().addClass('checked');
            $('#sourcefacebook').prop('checked',true);
            $('#sourcefacebook').parent().addClass('checked');
            $('#sourceinstagram').prop('checked',true);
            $('#sourceinstagram').parent().addClass('checked');
            $('#sourcenews').prop('checked',true);
            $('#sourcenews').parent().addClass('checked');
            $('#sourceplaystore').prop('checked',true);
            $('#sourceplaystore').parent().addClass('checked');
        }
        else {
            $('#sourcetwitter').prop('checked',false);
            $('#sourcetwitter').parent().removeClass('checked');
            $('#sourcefacebook').prop('checked',false);
            $('#sourcefacebook').parent().removeClass('checked');
            $('#sourceinstagram').prop('checked',false);
            $('#sourceinstagram').parent().removeClass('checked');
            $('#sourcenews').prop('checked',false);
            $('#sourcenews').parent().removeClass('checked');
            $('#sourceplaystore').prop('checked',false);
            $('#sourceplaystore').parent().removeClass('checked');
        }

    }
    $('#sourceall').on('change',function(ev){
        ev.preventDefault();
        setAllSource(this.checked);
        queryData();
    })
    $('#sourcetwitter').on('change',function(ev){
        ev.preventDefault();
        $('#sourcetwitter').prop('checked',this.checked);
        queryData();
    })
    $('#sourcefacebook').on('change',function(ev){
        ev.preventDefault();
        $('#sourcefacebook').prop('checked',this.checked);
        queryData();
    })
    $('#sourceinstagram').on('change',function(ev){
        ev.preventDefault();
        $('#sourceinstagram').prop('checked',this.checked);
        queryData();
    })
    $('#sourcenews').on('change',function(ev){
        ev.preventDefault();
        $('#sourcenews').prop('checked',this.checked);
        queryData();
    })
    $('#sourceplaystore').on('change',function(ev){
        ev.preventDefault();
        $('#sourceplaystore').prop('checked',this.checked);
        queryData();
    })
    $('#senPos').on('change',function(ev){
        ev.preventDefault();
        $('#senPos').prop('checked',this.checked);
        queryData();
    })
    $('#senNeg').on('change',function(ev){
        ev.preventDefault();
        $('#senNeg').prop('checked',this.checked);
        queryData();
    })
    $('#senNeu').on('change',function(ev){
        ev.preventDefault();
        $('#senNeu').prop('checked',this.checked);
        queryData();
    })
    $('#sourceall').prop('checked',true);
    setAllSource(true);
    function queryBySource(){

    }
    /*
        START WORDCLOUD BLOCK
        https://bl.ocks.org/blockspring/847a40e23f68d6d7e8b5
    */


    function drawDonut(data,id){
        var donut_chart = c3.generate({
            bindto: '#'+id,
            size: { width: 350 },
            color: {
                pattern: ['#3F51B5', '#FF9800', '#4CAF50', '#00BCD4', '#F44336']
            },
            data: {
                columns: data,
                type : 'donut'
            },
            donut: {
                title: ""
            }
        });
    }


    function drawWordCloud(word_count){

        console.log('wc',word_count)
        $('#wc').html('')

        var svg_location = "#wc";
        var width = $('#wc').width();
        var height = 400;

        var fill = d3.scale.category20();

        var word_entries = d3.entries(word_count);

        var xScale = d3.scale.linear()
        .domain([0, d3.max(word_entries, function(d) {return d.value;})])
        .range([10,100]);

        d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function(d) { return xScale(+d.value); })
        .text(function(d) { return d.key; })
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Times New Roman")
        .on("end", draw)
        .start();

        function draw(words) {
            d3.select(svg_location).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return xScale(d.value) + "px"; })
            .style("font-family", "Times New Roman")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.key; });
        }

        d3.layout.cloud().stop();
    }

    /* END WORDCLOUD BLOCK*/

    // Area chart
    // ------------------------------

    // Generate chart
    function line_chart(p1,p2){
        var line_chart = c3.generate({
            bindto: '#dailyBuzz',
            point: {
                r: 4
            },
            size: { height: 300 },
            color: {
                pattern: ['#33A9DD', '#405E99', '#D97AC5','#F8BC90','#33BBC2']
            },
            data: {
                columns: p1
            },
            axis: {
                y: {
                    label: {
                        text:'REACH',
                        position: 'outer-middle'
                    }
                },
                x: {
                    type: 'category',
                    categories: p2
                }
            },
            grid: {
                y: {
                    show: true
                }
            },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: 20,
                    y: 0,
                    step: 5
                }
            }
        });
    }

    var area_chart = c3.generate({
        bindto: '#voicetracker',
        size: { height: 300, width: ($('#voicetracker').width()-10) },
        point: {
            r: 4
        },
        color: {
            pattern: ['#3949AB']
        },
        data: {
            columns: [
                ['data2', 130, 100, 140, 200, 150, 50]
            ],
            types: {
                //data1: 'area-spline',
                data2: 'area-spline'
            }
        },
        grid: {
            y: {
                show: true
            }
        }
    });

    // Pie chart
    // ------------------------------

    function drawPie(data){
        var arr = [[],[],[]];
        for(var i=0;i<data.length;i++){
            if (data[i].key=='positive') arr[0] = ['Positive',data[i].doc_count]
            else if (data[i].key=='negative') arr[1] = ['Negative',data[i].doc_count]
            else if (data[i].key=='neutral') arr[2] = ['Neutral',data[i].doc_count]
        }
        console.log('pieChart',arr)
        console.log($('#sentiment').parent().width())
        var pie_chart = c3.generate({
            bindto: '#sentiment',
            size: { width: $('#sentiment').parent().width()-5},
            color: {
                pattern: ['#1EAAF2', '#E72565', '#159688']
            },
            data: {
                columns: arr,
                type : 'pie'
            }
        });
    }

    // Choropleth map

    // Bar chart
    // ------------------------------

    // Generate chart
    function barChart(par){
        var cols = ['SocialVoice'];
        for (var key in par){
            cols.push(par[key])
        }
        var bar_chart = c3.generate({
            bindto: '#barchart',
            size: { height: 300 },
            data: {
                columns: [
                    cols
                ],
                colors: {
                    SocialVoice: function(d) {
                        //console.log('data',d)
                        var col = '#00ff00'
                        if (d.index==0) col = '#3D5B97'
                        else if (d.index==1) col = '#5AADED'
                        else if (d.index==2) col = '#E72565'
                        else if (d.index == 3) col = '#FBB543'
                        return col;
                    }
                },
                type: 'bar'
            },
            legend: {
                show: false
            },

            bar: {
                width: {
                    ratio: 0.5
                }
            },
            grid: {
                y: {
                    show: true
                }
            }
        });
        var arrayOfPics = [
            "assets/images/usight/facebook_small.png",
            "assets/images/usight/twitter_small.png",
            "assets/images/usight/ig_small.png",
            "assets/images/usight/newssite_small.png",
            "assets/images/usight/google_play_small.png"
        ];
        d3.selectAll('#barchart .c3-axis-x .tick')
        .each(function(d,i){
            // clear tick contents and replace with image
            var self = d3.select(this);
            self.selectAll("*").remove();
            self.append('image')
            .attr("xlink:href", arrayOfPics[i])
            .attr("x", -10)
            .attr("y", 5)
            .attr("width", 20)
            .attr("height", 20);
        });
    }

    //Timeline
    //timeline([]);
    function timeline(data){
        var html = [],html_twitter = [], html_news = [],html_facebook = [], html_instagram = [], html_apps = [];
        var totalAll = 0, totalTwitter = 0, totalNews = 0, totalFacebook = 0, totalInstagram = 0, totalApps = 0;
        for (var i=0;i<data.length;i++){
            html.push('<div class="col-lg-12" >'+
                '<div class="panel border-left-lg border-left-primary timeline-content">'+
                    '<div class="panel-body">'+
                        '<div class="row">'+
                            '<ul class="media-list">'+
                                '<li class="media">'+
                                    '<div class="media-left">'+
                                        '<img src="'+data[i].img+'" class="img-circle img-xs" alt="assets/images/usight/twitter_small.png">'+
                                    '</div>'+
                                    '<div class="media-body">'+
                                        //'<a href="#">',
                                            data[i].user_name+
                                            '<img src="assets/images/usight/twitter_small.png" alt="" style="margin-left:10px">'+
                                            '<span class="label label-primary label-rounded" style="margin-left:10px">'+data[i].sentiment+'</span>'+
                                            '<span class="media-annotation pull-right">'+data[i].dt+'</span>'+
                                        //'</a>',
                                        '<span class="display-block text-muted">'+data[i].text+'</span>'+
                                    '</div>'+
                                '</li>'+
                            '</ul>'+
                        '</div>'+
                    '</div>'+
                    '<div class="panel-footer panel-footer-condensed">'+
                        '<div class="heading-elements">'+
                            '<ul class="list-inline list-inline-condensed heading-text pull-left">'+
                                //'<li><a href="javascript:void(0)" ><i class="icon-trash position-left"></i> Delete</a></li>'+
                                '<li><a href="'+data[i].url+'" ><i class="icon-link position-left"></i> Go to Link</a></li>'+
                                /*'<li class="dropdown">'+
                                    '<a href="#" class="text-default dropdown-toggle" data-toggle="dropdown"><i class="icon-menu7"></i> <span class="caret"></span></a>'+
                                    '<ul class="dropdown-menu dropdown-menu-right">'+
                                        '<li><a href="#"><i class="icon-alarm-add"></i> Check in</a></li>'+
                                        '<li><a href="#"><i class="icon-attachment"></i> Attach screenshot</a></li>'+
                                        '<li><a href="#"><i class="icon-rotate-ccw2"></i> Reassign</a></li>'+
                                        '<li class="divider"></li>'+
                                        '<li><a href="#"><i class="icon-pencil7"></i> Edit task</a></li>'+
                                        '<li><a href="#"><i class="icon-cross2"></i> Remove</a></li>'+
                                    '</ul>'+
                                '</li>'+*/
                            '</ul>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>');
            if (data[i].source == 'twitter') {
                html_twitter.push(html[i])
                totalTwitter = data[i].total
            }
            else if (data[i].source == 'news') {
                html_news.push(html[i])
                totalNews = data[i].total
            }
            else if (data[i].source == 'facebook') {
                html_facebook.push(html[i])
                totalFacebook = data[i].total
            }
            else if (data[i].source == 'instagram') {
                html_instagram.push(html[i])
                totalInstagram = data[i].total
            }
            else if (data[i].source == 'apps') {
                html_apps.push(html[i])
                totalApps = data[i].total
            }
        };
        if (html.length==0) html.push('Data not Available');
        if (html_twitter.length==0) html_twitter.push('Data not Available');
        if (html_news.length==0) html_news.push('Data not Available');
        if (html_facebook.length==0) html_facebook.push('Data not Available');
        if (html_instagram.length==0) html_instagram.push('Data not Available');
        if (html_apps.length==0) html_apps.push('Data not Available');
        totalAll = (totalTwitter+totalNews+totalFacebook+totalInstagram+totalApps);
        $('#totalAll').html(totalAll)
        $('#totalTwitter').html(totalTwitter)
        $('#totalFacebook').html(totalFacebook)
        $('#totalNews').html(totalNews)
        $('#totalInstagram').html(totalInstagram)
        $('#totalApps').html(totalApps)

        $('#allData').append(html.join(''))
        $('#twitterData').append(html_twitter.join(''))
        $('#newsData').append(html_news.join(''))
        $('#facebookData').append(html_facebook.join(''))
        $('#instagramData').append(html_instagram.join(''))
        $('#appsData').append(html_apps.join(''))
    }

    function catChart(p){
        var html = [];
        for(var key in p){
            html.push('<div class="row m-l-10 m-r-10">',
                '<div >',
                    '<h6 class="no-margin text-semibold">'+key.toUpperCase()+'</h6>',
                '</div>',
                '<div class="progress">',
                    '<div class="progress-bar bg-success-400" style="width: '+p[key].pos+'%">',
                        //'<span class="sr-only">20% Complete</span>',
                    '</div>',
                    '<div class="progress-bar progress-bar-danger" style="width: '+p[key].neg+'%">',
                        //'<span class="sr-only">30% Complete (danger)</span>',
                    '</div>',
                    '<div class="progress-bar progress-bar-info" style="width: '+p[key].neu+'%">',
                        //'<span>40%</span>',
                    '</div>',
                '</div>',
            '</div><br />');
        }
        $('#bottom-tab1').html(html.join(' '))
    }




    // Initialize lightbox
    $('[data-popup=lightbox]').fancybox({
        padding: 3
    });

var old_values = [];
var period = $(".select");
period.select2();
period.on('change',function(event){
    var values = [];
    $(event.currentTarget).find("option:selected").each(function(i, selected){
      values[i] = $(selected).text();
    });
    console.log("selected values: ", values, tracker);
    trackerName = values;
    fbAccount = '';
    var f = []
    keyword = []
    try{
        for (var i=0;i<tracker.length;i++){
            if (values.indexOf(tracker[i].trackername)>-1){
                f.push(tracker[i].facebook['facebookid'])
                for (var j=0;j<tracker[i].twitter.mainkeyword.split(',').length;j++){
                    try{
                        if (tracker[i].twitter.mainkeyword.split(',')[j].length>0) keyword.push(tracker[i].twitter.mainkeyword.split(',')[j])
                    }
                    catch(e){}
                }
            }

        }
        //keyword = JSON.parse(localStorage.getItem('usight-tracker')).twitter.mainkeyword
    }
    catch(e){}
    if (f.length == 0){
        for (var i=0;i<tracker.length;i++){
            f.push(tracker[i].facebook['facebookid'])
            console.log('sendBody2',tracker[i].facebook)
        }
    }
    fbAccount = f.join(',')
    if (keyword.length == 0){
        for (var i=0;i<tracker.length;i++){
            for (var j=0;j<tracker[i].twitter.mainkeyword.split(',').length;j++){
                try{
                    if (tracker[i].twitter.mainkeyword.split(',')[j].length>0) keyword.push(tracker[i].twitter.mainkeyword.split(',')[j])
                }
                catch(e){}
            }
        }
    }
    queryData();
})

$('.daterange-ranges').daterangepicker(
    {
        startDate: moment().subtract('days', 6),
        endDate: moment(),
        minDate: '01/01/2012',
        maxDate: '12/31/2019',
        dateLimit: { days: 60 },
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
            'Last 7 Days': [moment().subtract('days', 6), moment()],
            'Last 30 Days': [moment().subtract('days', 29), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        },
        opens: 'left',
        applyClass: 'btn-small bg-slate-600',
        cancelClass: 'btn-small btn-default'
    },
    function(start, end) {
        $('.daterange-ranges span').html(start.format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + end.format('MMMM D, YYYY'));
        //console.log('dateRange',start.format('YYYY-MM-DD'),end.format('YYYY-MM-DD'));
        startPeriod = start.format('YYYY-MM-DD');
        endPeriod = end.format('YYYY-MM-DD');
        queryData();
    }
);
// Display date format
$('.daterange-ranges span').html(moment().subtract('days', 6).format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + moment().format('MMMM D, YYYY'));
$(".styled, .multiselect-container input").uniform({
    radioClass: 'choice'
});

queryData()
function queryData(){
    /*$('#sourcetwitter').prop('checked',true);
    $('#sourcetwitter').parent().addClass('checked');
    $('#sourcefacebook').prop('checked',true);
    $('#sourcefacebook').parent().addClass('checked');
    $('#sourceinstagram').prop('checked',true);
    $('#sourceinstagram').parent().addClass('checked');
    $('#sourcenews').prop('checked',true);
    $('#sourcenews').parent().addClass('checked');
    $('#sourceplaystore').prop('checked',true);
    $('#sourceplaystore').parent().addClass('checked');*/
    source = []
    sentiment = []
    if ($('#sourcetwitter').prop('checked')==true) source.push('twitter')
    if ($('#sourcefacebook').prop('checked')==true) source.push('facebook')
    if ($('#sourceinstagram').prop('checked')==true) source.push('instagram')
    if ($('#sourcenews').prop('checked')==true) source.push('news')
    if ($('#sourceplaystore').prop('checked')==true) source.push('playstore')
    if ($('#senPos').prop('checked')==true) sentiment.push('positive')
    if ($('#senNeg').prop('checked')==true) sentiment.push('negative')
    if ($('#senNeu').prop('checked')==true) sentiment.push('neutral')

    console.log('QUERY DATA:')
    console.log('source',source);
    console.log('period',startPeriod,endPeriod)
    console.log('tracker',trackerName)
    console.log('sentiment',sentiment)
    var body = {
        source: source,
        startPeriod: startPeriod,
        endPeriod: endPeriod,
        trackerName: trackerName,
        sentiment: sentiment,
        keywords: keyword.join(','),
        fb: fbAccount,
        max:40
    }
    console.log('sendBody',body)
    /*$.post(api+'/api-sentiment/wordCloud',body,function(e,r){
        console.log('aa',e)
        console.log('ab',r)
        drawWordCloud(e.message);
    });
    $.post(api+'/api-sentiment/sentiment',body,function(e,r){
        console.log('sentiment',e)
        console.log('ab',r)
        drawPie(e.message);
    });
    $.post(api+'/api-sentiment/sums_up',body,function(e,r){
        console.log('aa',e)
        console.log('ab',r)
        barChart(e.message);
    });
    $.post(api+'/api-sentiment/category',body,function(e,r){
        console.log('category',e)
        console.log('category',r);
        var ee = {
            "other": {"pos": 0,"neg": 0,"neu": 0},
            "informasi": {"pos": 0,"neg": 0,"neu": 0},
            "aplikasi": {"pos": 0,"neg": 0,"neu": 0},
            "fitur": {"pos": 0,"neg": 0,"neu": 0},
            "promosi": {"pos": 0,"neg": 0,"neu": 0},
            "pengiriman": {"pos": 0,"neg": 0,"neu": 0},
            "pembelian": {"pos": 0,"neg": 0,"neu": 0},
            "payment": {"pos": 0,"neg": 0,"neu": 0}
        }
        for (var key in e.message){
            ee[key]['pos'] = ((e.message[key].positive/ (e.message[key].positive+e.message[key].negative+e.message[key].neutral))*100)
            ee[key]['neg'] = ((e.message[key].negative/ (e.message[key].positive+e.message[key].negative+e.message[key].neutral))*100)
            ee[key]['neu'] = ((e.message[key].neutral/ (e.message[key].positive+e.message[key].negative+e.message[key].neutral))*100)
        }
        catChart(ee)
        //barChart(e.message);
    });
    $.post(api+'/api-sentiment/buzz',body,function(e,r){
        console.log('buzze',e)
        console.log('buzzr',r)
        var a = moment(startPeriod);
        var b = moment(endPeriod);
        var arrdate = []

        for (var m = moment(a); m.isBefore(b); m.add('days', 1)) {
            console.log('buzz',m.format('YYYY-MM-DD'));
            arrdate.push(m.format('YYYY-MM-DD'))
        }
        var par = [];
        var par2 = [];
        var a1 = [];
        a1 = ['twitter']
        a2 = ['facebook']
        a3 = ['instagram']
        a4 = ['news']
        a5 = ['playstore']

        for (var i=0;i<arrdate.length;i++){
            var stat1 = false;
            for (var j=0;j<e.message['twitter'].length;j++){
                if (arrdate[i]==e.message.twitter[j].dt) stat1=e.message.twitter[j].total
            }
            if (stat1==false) a1.push(0)
            else a1.push(stat1)

            var stat2 = false;
            for (var j=0;j<e.message['facebook'].length;j++){
                if (arrdate[i]==e.message.facebook[j].dt) stat2=e.message.facebook[j].total
            }
            if (stat2==false) a2.push(0)
            else a2.push(stat2)
            a3.push(0)
            a4.push(0)
            a5.push(0)
            par2.push(arrdate[i].split('-')[1]+'/'+arrdate[i].split('-')[2])
        }
        par.push(a1,a2,a3,a4,a5)

        console.log('buzzpar',par,par2)
        line_chart(par,par2);
    });
    $('#allData').html('');
    $.post(api+'/api-sentiment/timeline',body,function(e,r){
        console.log('timeline',e)
        console.log('timeline',r)
        $('#allData').html('');
        $('#twitterData').html('');
        $('#facebookData').html('');
        $('#newsData').html('');
        $('#instagramData').html('');
        $('#appsData').html('');
        timeline(e.message);
        //$('#totalAll').html(e.message[0].total);
    });*/
    $.post(api+'/api-recomendation/recomendation',body,function(e,r){
        console.log('aa',e)
        console.log('ab',r);
        var html = []
        var i = 1;
        for (var key in e.message){
            if (i==1){
                html.push('<div class="row">')
            }
            html.push('<div class="col-lg-6">',
                '<div class="panel panel-flat" >',
                    '<div class="panel-heading">',
                        '<h6 class="panel-title">'+key+'</h6>',
                    '</div>',
                    '<div class="panel-body" style="height:500px">',
                        '<div class="chart-container text-center">',
                            '<div class="display-inline-block" id="chart_'+key+'"></div>',
                        '</div>',
                        '<div>',
                            '<div id="list_'+key+'" style="overflow-y: auto;height: 150px;">',
                                //<li>asd</li>
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>')
            if (i==3){
                html.push('</div>')
            }
            i++;
            if (i==4) i=1;
        }
        $('#contentRec').html(html.join(''))
        //Draw Donut
        var total = {}
        for (var key in e.message){
            total[key] = 0
            for (var i=0;i<e.message[key].length;i++){
                total[key] += e.message[key][i].doc_count
            }
        }
        var d = {}
        for (var key in e.message){
            var d = [
                ["High Priority"],
                ["Low Priority"]
            ];
            var htmlList = [];
            e.message[key].sort(compare)
            for (var i=0;i<10;i++){

                if (e.message[key][i]){
                    console.log('alldata_'+key,e.message[key][i],total[key],(e.message[key][i].doc_count/total[key]*100))
                    htmlList.push('<div style="margin-bottom:5px">');
                    if (e.message[key][i].doc_count/total[key]*100>10){
                        console.log('alldataPush_',d)
                        d[0].push(e.message[key][i].doc_count)
                        htmlList.push('<span class="badge badge-primary">'+e.message[key][i].doc_count+'</span>&nbsp;&nbsp;'+e.message[key][i].key+' <br /> ')
                    }
                    else {
                        htmlList.push('<span class="badge badge-warning">'+e.message[key][i].doc_count+'</span>&nbsp;&nbsp;'+e.message[key][i].key+' <br /> ')
                        d[1].push(e.message[key][i].doc_count)
                    }
                    htmlList.push('</div>');
                }

            }
            console.log('alldata',d,key)
            drawDonut(d,'chart_'+key)
            $('#list_'+key).html(htmlList.join(''))
        }
        //drawWordCloud(e.message);
    });
    function compare(a,b) {
      if (a.doc_count > b.doc_count)
        return -1;
      if (a.doc_count < b.doc_count)
        return 1;
      return 0;
    }

    drawDonut([
        ['data1', 30,20],
        ['data2', 120],
    ],'svcInfo');
    drawDonut([
        ['data1', 10],
        ['data2', 90],
    ],'promotion');
    drawDonut([
        ['data1', 30],
        ['data2', 70],
        ['data3', 70],
    ],'purchasing');

}


});
