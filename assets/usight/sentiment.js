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
    var text_string = "Of course that’s your contention. You’re a first year grad student. You just got finished readin’ some Marxian historian, Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend, you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in 50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges at the public library.";

      drawWordCloud(text_string);

      function drawWordCloud(text_string){
        var common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";

        var word_count = {};

        var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
          if (words.length == 1){
            word_count[words[0]] = 1;
          } else {
            words.forEach(function(word){
              var word = word.toLowerCase();
              if (word != "" && common.indexOf(word)==-1 && word.length>1){
                if (word_count[word]){
                  word_count[word]++;
                } else {
                  word_count[word] = 1;
                }
              }
            })
          }

        var svg_location = "#wc";
        var width = $('#wc').width();
        var height = 400;

        var fill = d3.scale.category20();

        var word_entries = d3.entries(word_count);

        var xScale = d3.scale.linear()
           .domain([0, d3.max(word_entries, function(d) {
              return d.value;
            })
           ])
           .range([10,100]);

        d3.layout.cloud().size([width, height])
          .timeInterval(20)
          .words(word_entries)
          .fontSize(function(d) { return xScale(+d.value); })
          .text(function(d) { return d.key; })
          .rotate(function() { return ~~(Math.random() * 2) * 90; })
          .font("Impact")
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
              .style("font-family", "Impact")
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

    // Generate chart
    var pie_chart = c3.generate({
        bindto: '#sentiment',
        //size: { width: $('#voicetracker').width()-5},
        color: {
            pattern: ['#1EAAF2', '#E72565', '#159688']
        },
        data: {
            columns: [
                ['Positive', 30],
                ['Negative', 120],
                ['Neutral', 120]
            ],
            type : 'pie'
        }
    });

    // Choropleth map

    // Bar chart
    // ------------------------------

    // Generate chart
    var bar_chart = c3.generate({
        bindto: '#barchart',
        size: { height: 300 },
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 130, 100, 140, 200, 150, 50]
            ],
            type: 'bar'
        },
        color: {
            pattern: ['#2196F3', '#FF9800', '#4CAF50']
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


$('.select').select2();
$('.daterange-ranges').daterangepicker(
    {
        startDate: moment().subtract('days', 29),
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
    }
);
// Display date format
$('.daterange-ranges span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' &nbsp; - &nbsp; ' + moment().format('MMMM D, YYYY'));
$(".styled, .multiselect-container input").uniform({
    radioClass: 'choice'
});



});
