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
    var displayname = JSON.parse(localStorage.getItem('usight-user')).firstname+ ' ' + JSON.parse(localStorage.getItem('usight-user')).lastname
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
    console.log('tw2',keyword)

    $('#hello').html('Hello '+displayname+'!');

    /*
    START WORDCLOUD BLOCK
    https://bl.ocks.org/blockspring/847a40e23f68d6d7e8b5
    */
    $.post(api+'/api/wordCloud',{project:'',max:80,total:250,keywords:keyword.join(',')},function(e,r){
        console.log('aa',e)
        console.log('ab',r)
        drawWordCloud(e.message);
    });

    function drawWordCloud(word_count){

        console.log('wc',word_count)

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
    var today = new Date();
    today = dateString(today);

    var todayMin = new Date();
    todayMin.setDate(todayMin.getDate() - 7);
    todayMin = dateString(todayMin);
    var arrDate = []

    for (var i=7;0<i;i--){
        var x = new Date()
        x.setDate(x.getDate() - (i-1));
        arrDate.push(dateString(x))
    }

    function dateString(d){
        var dd = d.getDate();
        var mm = d.getMonth()+1; //January is 0!
        var yyyy = d.getFullYear();
        if(dd<10) dd='0'+dd
        if(mm<10) mm='0'+mm
        return yyyy+'-'+mm+'-'+dd;

    }

    $.post(api+'/api/agg_date',{project:'',start:todayMin,end:today,keywords:keyword.join(',')},function(d){
        console.log('agg_Date aa',d);
        var objDate = {
            twitter:{},
            facebook: {}
        }
        for (var i=0;i<arrDate.length;i++){
            objDate.twitter[arrDate[i]] = 0;
            objDate.facebook[arrDate[i]] = 0;
        }
        if (d.type=='success'){
            for (var i=0;i<arrDate.length;i++){
                for (var j=0;j<d.message.twitter.length;j++){
                    if(d.message.twitter[j].key_as_string.indexOf(arrDate[i])>-1){
                        objDate.twitter[arrDate[i]] = d.message.twitter[j].doc_count;
                    }
                }
                for (var j=0;j<d.message.facebook.length;j++){
                    if(d.message.facebook[j].key_as_string.indexOf(arrDate[i])>-1){
                        objDate.facebook[arrDate[i]] = d.message.facebook[j].doc_count;
                    }
                }
            }
        }
        console.log('objDate',objDate,arrDate)
        //drawWordCloud(e.message);
        areaChart(objDate,arrDate);
    });
    function getDay(dInp){
        var d = new Date(dInp);
        var weekday = new Array(7);
        weekday[0] =  "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";
        return weekday[d.getDay()];
    }

    function areaChart (objDate,arrDate){
        var x = ['x'],xOth = [],xOthAll=[];
        for (var i=0;i<arrDate.length;i++){
            x.push(getDay(arrDate[i]))
        }
        var types = {}
        for (var key in objDate){
            xOth = []
            xOth.push(key);
            for (var key2 in objDate[key]){
                xOth.push(objDate[key][key2])
            }
            xOthAll.push(xOth)
            types[key] = 'area-spline'
        }
        console.log('xOth',xOthAll)
        console.log('x',x)
        var cols = [];
        cols.push(x)
        for (var i=0;i<xOthAll.length;i++){
            cols.push(xOthAll[i])
        }

        console.log(cols)
        var area_stacked_chart = c3.generate({
            bindto: '#voicetracker',
            size: { height: 300, width: $('#voicetracker').parent().width()-20 },
            color: {
                pattern: ['#1E88E5', '#F4511E']
            },
            point: {
                r: 4
            },
            data: {
                x:'x',
                columns: cols /*[
                    ['x', 'sun', 'sat','asd', 'sss', 'asddd', 'www'],
                    ['data1', 300, 350, 300, 0, 0, 120],
                    ['data2', 130, 100, 140, 200, 150, 50]
                ]*/,
                types: types /*{
                    data1: 'area-spline',
                    data2: 'area-spline'
                }*/
                //groups: [['data1', 'data2']]
            },
            axis: {
                x: {
                    type: 'category'
                }
            },
            grid: {
                y: {
                    show: true
                }
            }
        });
    }


    // Pie chart
    // ------------------------------

    // Generate chart
    $.post(api+'/api/sentiment',{project:'',keywords:keyword.join(',')},function(e,r){
        console.log('sentiment',e)
        console.log('ab',r)
        drawPie(e.message);
    });
    //drawPie();
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
    $('.map-choropleth').vectorMap({
        map: 'world_mill_en',
        backgroundColor: 'transparent',
        series: {
            regions: [{
                values: gdpData,
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial'
            }]
        },
        onRegionLabelShow: function(e, el, code){
            el.html(el.html()+'<br>'+'GDP - '+gdpData[code]);
        }
    });

    // Bar chart
    // ------------------------------

    // Generate chart
    $.post(api+'/api/sums_up',{project:'',keywords:keyword.join(',')},function(e,r){
        console.log('aa',e)
        console.log('ab',r)
        barChart(e.message);
    });
    barChart();
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
            "assets/images/usight/newssite_small.png"
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

    $.post(api+'/api/top5',{project:'',keywords:keyword.join(',')},function(e,r){
        console.log('top5e',e)
        console.log('top5r',r);
        var html = [];
        for(var i=0;i<e.message.length;i++){
            html.push('<div class="col-lg-12 col-md-12" style="padding-left:0px;padding-right:0px;">',
                '<div class="panel panel-body" style="padding:5px;margin-bottom:10px;">',
                    '<div class="media">',
                        '<div class="media-left">',
                            '<a href="'+e.message[i].image+'" data-popup="lightbox">',
                                '<img src="'+e.message[i].image+'" class="img-circle" alt="">',
                            '</a>',
                        '</div>',
                        '<div class="media-body">',
                            '<span class="media-heading" style="margin-top:10px">'+e.message[i].screen_name+'</span>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>')
        }
        console.log(html)
        $('#top5').html(html.join(' '))

    });



    // Initialize lightbox
    $('[data-popup=lightbox]').fancybox({
        padding: 3
    });
});
