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
    var startPeriod = moment().subtract('days', 6).format('YYYY-MM-DD'), endPeriod = moment().format('YYYY-MM-DD');
    var source = [];
    var sentiment = [];
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


    console.log('sentiment')
    var range_all_sliders = {
        'min': [     0 ],
        '10%': [   5,  5 ],
        '50%': [  40, 10 ],
        'max': [ 100 ]
    };
    var pips_range = document.getElementById('noui-slider-pips-range');

    // Create slider
    noUiSlider.create(pips_range, {
        range: range_all_sliders,
        start: 40,
        connect: 'lower',
        pips: {
            mode: 'range',
            density: 3
        }
    });


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


    // Bullet charts
    // ------------------------------

    // Initialize chart
    bulletChart("#bullets", 80);

    // Chart setup
    function bulletChart(element, height) {


        // Bullet chart core
        // ------------------------------

        bulletCore();
        function bulletCore() {

            // Construct
            d3.bullet = function() {

                // Default layout variables
                var orient = "left",
                    reverse = false,
                    duration = 750,
                    ranges = bulletRanges,
                    markers = bulletMarkers,
                    measures = bulletMeasures,
                    height = 30,
                    tickFormat = null;

                // For each small multiple…
                function bullet(g) {
                    g.each(function(d, i) {

                        // Define variables
                        var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
                            markerz = markers.call(this, d, i).slice().sort(d3.descending),
                            measurez = measures.call(this, d, i).slice().sort(d3.descending),
                            g = d3.select(this);

                        // Compute the new x-scale.
                        var x1 = d3.scale.linear()
                            .domain([0, Math.max(rangez[0], markerz[0], measurez[0])])
                            .range(reverse ? [width, 0] : [0, width]);

                        // Retrieve the old x-scale, if this is an update.
                        var x0 = this.__chart__ || d3.scale.linear()
                            .domain([0, Infinity])
                            .range(x1.range());

                        // Stash the new scale.
                        this.__chart__ = x1;

                        // Derive width-scales from the x-scales.
                        var w0 = bulletWidth(x0),
                            w1 = bulletWidth(x1);



                        // Setup range
                        // ------------------------------

                        // Update the range rects
                        var range = g.selectAll(".bullet-range")
                            .data(rangez);

                        // Append range rect
                        range.enter()
                            .append("rect")
                                .attr("class", function(d, i) { return "bullet-range bullet-range-" + (i + 1); })
                                .attr("width", w0)
                                .attr("height", height)
                                .attr('rx', 2)
                                .attr("x", reverse ? x0 : 0)

                        // Add loading animation
                        .transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("x", reverse ? x1 : 0);

                        // Add update animation
                        range.transition()
                            .duration(duration)
                            .attr("x", reverse ? x1 : 0)
                            .attr("width", w1)
                            .attr("height", height);



                        // Setup measures
                        // ------------------------------

                        // Update the measure rects
                        var measure = g.selectAll(".bullet-measure")
                            .data(measurez);

                        // Append measure rect
                        measure.enter()
                            .append("rect")
                                .attr("class", function(d, i) { return "bullet-measure bullet-measure-" + (i + 1); })
                                .attr("width", w0)
                                .attr("height", height / 5)
                                .attr("x", reverse ? x0 : 0)
                                .attr("y", height / 2.5)
                                .style("shape-rendering", "crispEdges");

                        // Add loading animation
                        measure.transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("x", reverse ? x1 : 0);

                        // Add update animation
                        measure.transition()
                            .duration(duration)
                            .attr("width", w1)
                            .attr("height", height / 5)
                            .attr("x", reverse ? x1 : 0)
                            .attr("y", height / 2.5);



                        // Setup markers
                        // ------------------------------

                        // Update the marker lines
                        var marker = g.selectAll(".bullet-marker")
                            .data(markerz);

                        // Append marker line
                        marker.enter()
                            .append("line")
                                .attr("class", function(d, i) { return "bullet-marker bullet-marker-" + (i + 1); })
                                .attr("x1", x0)
                                .attr("x2", x0)
                                .attr("y1", height / 6)
                                .attr("y2", height * 5 / 6);

                        // Add loading animation
                        marker.transition()
                            .duration(duration)
                            .attr("x1", x1)
                            .attr("x2", x1);

                        // Add update animation
                        marker.transition()
                            .duration(duration)
                            .attr("x1", x1)
                            .attr("x2", x1)
                            .attr("y1", height / 6)
                            .attr("y2", height * 5 / 6);



                        // Setup axes
                        // ------------------------------

                        // Compute the tick format.
                        var format = tickFormat || x1.tickFormat(8);

                        // Update the tick groups.
                        var tick = g.selectAll(".bullet-tick")
                            .data(x1.ticks(8), function(d) {
                                return this.textContent || format(d);
                            });

                        // Initialize the ticks with the old scale, x0.
                        var tickEnter = tick.enter()
                            .append("g")
                                .attr("class", "bullet-tick")
                                .attr("transform", bulletTranslate(x0))
                                .style("opacity", 1e-6);

                        // Append line
                        tickEnter.append("line")
                            .attr("y1", height)
                            .attr("y2", (height * 7 / 6) + 3);

                        // Append text
                        tickEnter.append("text")
                            .attr("text-anchor", "middle")
                            .attr("dy", "1em")
                            .attr("y", (height * 7 / 6) + 4)
                            .text(format);

                        // Transition the entering ticks to the new scale, x1.
                        tickEnter.transition()
                            .duration(duration)
                            .attr("transform", bulletTranslate(x1))
                            .style("opacity", 1);

                        // Transition the updating ticks to the new scale, x1.
                        var tickUpdate = tick.transition()
                            .duration(duration)
                            .attr("transform", bulletTranslate(x1))
                            .style("opacity", 1);

                        // Update tick line
                        tickUpdate.select("line")
                            .attr("y1", height + 3)
                            .attr("y2", (height * 7 / 6) + 3);

                        // Update tick text
                        tickUpdate.select("text")
                            .attr("y", (height * 7 / 6) + 4);

                        // Transition the exiting ticks to the new scale, x1.
                        tick.exit()
                            .transition()
                                .duration(duration)
                                .attr("transform", bulletTranslate(x1))
                                .style("opacity", 1e-6)
                                .remove();



                        // Resize chart
                        // ------------------------------

                        // Call function on window resize
                        $(window).on('resize', resizeBulletsCore);

                        // Call function on sidebar width change
                        $(document).on('click', '.sidebar-control', resizeBulletsCore);

                        // Resize function
                        //
                        // Since D3 doesn't support SVG resize by default,
                        // we need to manually specify parts of the graph that need to
                        // be updated on window resize
                        function resizeBulletsCore() {

                            // Layout variables
                            width = d3.select("#bullets").node().getBoundingClientRect().width - margin.left - margin.right;
                            w1 = bulletWidth(x1);


                            // Layout
                            // -------------------------

                            // Horizontal range
                            x1.range(reverse ? [width, 0] : [0, width]);


                            // Chart elements
                            // -------------------------

                            // Measures
                            g.selectAll(".bullet-measure").attr("width", w1).attr("x", reverse ? x1 : 0);

                            // Ranges
                            g.selectAll(".bullet-range").attr("width", w1).attr("x", reverse ? x1 : 0);

                            // Markers
                            g.selectAll(".bullet-marker").attr("x1", x1).attr("x2", x1)

                            // Ticks
                            g.selectAll(".bullet-tick").attr("transform", bulletTranslate(x1))
                        }
                    });

                    d3.timer.flush();
                }


                // Constructor functions
                // ------------------------------

                // Left, right, top, bottom
                bullet.orient = function(x) {
                    if (!arguments.length) return orient;
                    orient = x;
                    reverse = orient == "right" || orient == "bottom";
                    return bullet;
                };

                // Ranges (bad, satisfactory, good)
                bullet.ranges = function(x) {
                    if (!arguments.length) return ranges;
                    ranges = x;
                    return bullet;
                };

                // Markers (previous, goal)
                bullet.markers = function(x) {
                    if (!arguments.length) return markers;
                    markers = x;
                    return bullet;
                };

                // Measures (actual, forecast)
                bullet.measures = function(x) {
                    if (!arguments.length) return measures;
                    measures = x;
                    return bullet;
                };

                // Width
                bullet.width = function(x) {
                    if (!arguments.length) return width;
                    width = x;
                    return bullet;
                };

                // Height
                bullet.height = function(x) {
                    if (!arguments.length) return height;
                    height = x;
                    return bullet;
                };

                // Axex tick format
                bullet.tickFormat = function(x) {
                    if (!arguments.length) return tickFormat;
                    tickFormat = x;
                    return bullet;
                };

                // Transition duration
                bullet.duration = function(x) {
                    if (!arguments.length) return duration;
                    duration = x;
                    return bullet;
                };

                return bullet;
            };

            // Ranges
            function bulletRanges(d) {
                return d.ranges;
            }

            // Markers
            function bulletMarkers(d) {
                return d.markers;
            }

            // Measures
            function bulletMeasures(d) {
                return d.measures;
            }

            // Positioning
            function bulletTranslate(x) {
                return function(d) {
                    return "translate(" + x(d) + ",0)";
                };
            }

            // Width
            function bulletWidth(x) {
                var x0 = x(0);
                return function(d) {
                    return Math.abs(x(d) - x0);
                };
            }
        }



        // Basic setup
        // ------------------------------

        // Main variables
        var d3Container = d3.select(element),
            margin = {top: 20, right: 10, bottom: 35, left: 10},
            width = width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right,
            height = height - margin.top - margin.bottom;



        // Construct chart layout
        // ------------------------------

        var chart = d3.bullet()
            .width(width)
            .height(height);



        // Load data
        // ------------------------------

        d3.json("assets/demo_data/dashboard/bullets.json", function(error, data) {

            // Show what's wrong if error
            if (error) return console.error(error);


            // Create SVG
            // ------------------------------

            // SVG container
            var container = d3Container.selectAll("svg")
                .data(data)
                .enter()
                .append('svg');

            // SVG group
            var svg = container
                .attr("class", function(d, i) { return "bullet-" + (i + 1); })
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(chart);



            // Add title
            // ------------------------------

            // Title group
            var title = svg.append("g")
                .style("text-anchor", "start");

            // Bullet title text
            title.append("text")
                .attr("class", "bullet-title")
                .attr('y', -10)
                .text(function(d) { return d.title; });

            // Bullet subtitle text
            title.append("text")
                .attr("class", "bullet-subtitle")
                .attr('x', width)
                .attr('y', -10)
                .style("text-anchor", "end")
                .text(function(d) { return d.subtitle; })
                .style('opacity', 0)
                .transition()
                    .duration(500)
                    .delay(500)
                    .style('opacity', 1);



            // Add random transition for demo
            // ------------------------------

            // Bind data
            var interval = function() {
                svg.datum(randomize).call(chart.duration(750));
            }

            // Set interval
            var intervalIds = [];
            intervalIds.push(
                setInterval(function() {
                    interval()
                }, 5000)
            );

            // Add Switchery toggle control
            var realtime = document.querySelector('.switcher');
            var realtimeInit = new Switchery(realtime);
            realtime.onchange = function() {
                if(realtime.checked) {
                    intervalIds.push(setInterval(function() { interval() }, 5000));
                }
                else {
                    for (var i=0; i < intervalIds.length; i++) {
                        clearInterval(intervalIds[i]);
                    }
                }
            };



            // Resize chart
            // ------------------------------

            // Call function on window resize
            $(window).on('resize', bulletResize);

            // Call function on sidebar width change
            $(document).on('click', '.sidebar-control', bulletResize);

            // Resize function
            //
            // Since D3 doesn't support SVG resize by default,
            // we need to manually specify parts of the graph that need to
            // be updated on window resize
            function bulletResize() {

                // Layout variables
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;


                // Layout
                // -------------------------

                // Main svg width
                container.attr("width", width + margin.left + margin.right);

                // Width of appended group
                svg.attr("width", width + margin.left + margin.right);


                // Chart elements
                // -------------------------

                // Subtitle
                svg.selectAll('.bullet-subtitle').attr("x", width);
            }
        });



        // Randomizers
        // ------------------------------

        function randomize(d) {
            if (!d.randomizer) d.randomizer = randomizer(d);
            d.ranges = d.ranges.map(d.randomizer);
            d.markers = d.markers.map(d.randomizer);
            d.measures = d.measures.map(d.randomizer);
            return d;
        }
        function randomizer(d) {
            var k = d3.max(d.ranges) * .2;
            return function(d) {
                return Math.max(0, d + k * (Math.random() - .5));
            };
        }
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
    console.log("selected values: ", values);
    trackerName = values;
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
        max:40
    }
    console.log('sendBody',body)
    $.post(api+'/api-sentiment/wordCloud',body,function(e,r){
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

}


});
