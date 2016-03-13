var data = {
  "weekly": [
    {
      "date": "2016-02-29",
      "Used": 0.6,
      "Forecast": 0,
      "UK-average": 0.9
    },
    {
      "date": "2016-03-07",
      "Used": 0.5,
      "Forecast": 0,
      "UK-average": 0.8
    },
    {
      "date": "2016-03-14",
      "Used": 0.2,
      "Forecast": 0.3,
      "UK-average": 0.8
    },
    {
      "date": "2016-03-21",
      "Used": 0,
      "Forecast": 0.7,
      "UK-average": 1.1
    }
  ],
  "daily": [
    {
      "date": "2016-03-03",
      "Used": 0.6,
      "Forecast": 0,
      "UK-average": 0.1
    },
    {
      "date": "2016-03-04",
      "Used": 0.5,
      "Forecast": 0,
      "UK-average": 0.15
    },
    {
      "date": "2016-03-05",
      "Used": 0.2,
      "Forecast": 0.3,
      "UK-average": 0.2
    },
    {
      "date": "2016-03-06",
      "Used": 0,
      "Forecast": 0.6,
      "UK-average": 0.25
    },
    {
      "date": "2016-03-07",
      "Used": 0,
      "Forecast": 0.6,
      "UK-average": 0.4
    },
    {
      "date": "2016-03-08",
      "Used": 0,
      "Forecast": 0.7,
      "UK-average": 0.5
    },
    {
      "date": "2016-03-09",
      "Used": 0,
      "Forecast": 0.7,
      "UK-average": 0.6
    }
  ]
};
// Stacked bars from https://bl.ocks.org/mbostock/1134768
var causes = ["Used", "Forecast"];

var margin = { top: 40, right: 20, bottom: 30, left: 55, columns: 7 },
  width = 480 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var z = d3.scale.category20();

var GB = d3.locale({
  "decimal": ".",
  "thousands": ",",
  "grouping": [3],
  "currency": ["£", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%m/%d/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width, 0)
    .tickFormat(GB.numberFormat("$.2f"));

function plotGraph(timeStep) {
  var svg = d3.select("#stacked-bars-" + timeStep).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xFormat = {
    daily: '%a',
    weekly: '%d/%m'
  }[timeStep];

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format(xFormat));

  var layers = d3.layout.stack()(causes.map(function(c) {
    return data[timeStep].map(function(d) {
      return { x: new Date(d.date), y: d[c] };
    });
  }));

  x.domain(layers[0].map(function(d) {
    return d.x;
  }));

  var maxYLayers = d3.max(layers[layers.length - 1], function(d) {
    return d.y0 + d.y;
  })
  var maxYLines = d3.max(data[timeStep], function(d) {
    return d["UK-average"];
  })
  var maxY = Math.max(maxYLines, maxYLayers);

  y.domain([0, maxY]).nice();

  // Append the axes to the document BEFORE we append groups ('g') to the layers
  // to ensure that the ticks are BEHIND the bars
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0, 0)")
      .call(yAxis);

  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) {
        return z(i);
      });

  layer.selectAll("rect")
      .data(function(d) {
        return d;
      })
    .enter().append("rect")
      .attr("x", function(d) {
        return x(d.x) + margin.columns;
      })
      .attr("y", function(d) {
        return y(d.y + d.y0);
      })
      .attr("height", function(d) {
        return y(d.y0) - y(d.y + d.y0);
      })
      .attr("width", x.rangeBand() - 2 * margin.columns);


  // There are lines already plotted in the form of ticks on the axes
  // we ALWAYS want to plot the UK Averages, so we can select for 'circle'
  // This ensures that the .enter() method always sees these lines as newly added
  var lines = svg.selectAll('circle')
      .data(data[timeStep])

  var newLines = lines.enter();

  newLines.append('line')
      .attr('x1', function(d, i) {
        d.x1 = x(new Date(d.date));
        return d.x1;
      })
      .attr('x2', function(d, i) {
        return d.x1 + x.rangeBand();
      })
      .attr('y1', function(d, i) {
        d.y1 = y(d['UK-average']);
        return d.y1;
      })
      .attr('y2', function(d, i) {
        return d.y1;
      })
      .attr("class", "uk-average");

  var legend = svg.append("g")
      .attr("transform", "translate(0, -40)")
      .attr("class", "legend");

  legend.append('rect')
      .attr('x', 10)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('style', 'fill: ' + d3.scale.category20()());

  legend.append('text')
      .text('Your usage')
      .attr('x', 30)
      .attr('y', 12);

  legend.append('rect')
      .attr('x', 130)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('style', 'fill: #aec7e8');

  legend.append('text')
      .text('Predicted')
      .attr('x', 150)
      .attr('y', 12);

  legend.append('line')
      .attr('x1', 238)
      .attr('y1', 7)
      .attr('x2', 257)
      .attr('y2', 7)
      .attr("class", "uk-average");

  legend.append('text')
      .text('UK average')
      .attr('x', 260)
      .attr('y', 12);
}

$('#advanced-user-interactions-weekly').hide();

plotGraph('daily');
plotGraph('weekly');

$('#daily-graph').click(function() {
  if ($(this).hasClass('active')) return;
  $(this).addClass('active');
  $('#stacked-bars-daily').show();
  $('#weekly-graph').removeClass('active');
  $('#stacked-bars-weekly').hide();

});

$('#weekly-graph').click(function() {
  if ($(this).hasClass('active')) return;
  $(this).addClass('active');
  $('#stacked-bars-weekly').show();
  $('#daily-graph').removeClass('active');
  $('#stacked-bars-daily').hide();
});
