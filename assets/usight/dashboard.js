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
    /*
        START WORDCLOUD BLOCK
        https://bl.ocks.org/blockspring/847a40e23f68d6d7e8b5
    */
    var text_string = "Of course that’s your contention. You’re a first year grad student. You just got finished readin’ some Marxian historian, Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend, you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in 50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges at the public library.";

      //drawWordCloud(text_string);

      $.post(api+'/api/wordCloud',{project:'',max:50,total:150},function(e,r){
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

    // Generate chart
    $.post(api+'/api/sentiment',{project:''},function(e,r){
        console.log('aa',e)
        console.log('ab',r)
        drawPie(e.message);
    });
    drawPie();
    function drawPie(data){
        var arr = [[],[],[]];
        for(var i=0;i<data.length;i++){
            if (data[i].key=='positive') arr[0] = ['Positive',data[i].doc_count]
            else if (data[i].key=='negative') arr[1] = ['Negative',data[i].doc_count]
            else if (data[i].key=='neutral') arr[2] = ['Neutral',data[i].doc_count]
        }
        console.log('pieChart',arr)
        var pie_chart = c3.generate({
            bindto: '#sentiment',
            size: { width: $('#voicetracker').width()-5},
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
