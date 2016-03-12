// Stacked bars from https://bl.ocks.org/mbostock/1134768
var causes = ["Used", "Forecast"];

var margin = { top: 20, right: 20, bottom: 30, left: 55, columns: 7 },
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
  .tickFormat(GB.numberFormat("$.2f"));

function plotGraph(timeStep) {
  var xFormat = {
    daily: '%a',
    weekly: '%d/%m'
  }[timeStep];

  var svg = d3.select("#advanced-user-interactions-" + timeStep).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format(xFormat));

  // daily-gbp.csv
  d3.csv(timeStep + "-gbp.csv", type, function(error, crimea) {
    if (error) throw error;

    var layers = d3.layout.stack()(causes.map(function(c) {
      return crimea.map(function(d) {
        return { x: d.date, y: d[c] };
      });
    }));

    x.domain(layers[0].map(function(d) {
      return d.x;
    }));
    y.domain([0, d3.max(layers[layers.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

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

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0, 0)")
      .call(yAxis);
  });

  function type(d) {
    d.date = new Date(d.date);
    causes.forEach(function(c) { d[c] = +d[c]; });
    return d;
  }
}


$('#advanced-user-interactions-weekly').hide();

plotGraph('daily');
plotGraph('weekly');

$('#daily-graph').click(function() {
  $('#advanced-user-interactions-daily').show();
  $('#advanced-user-interactions-weekly').hide();
});

$('#weekly-graph').click(function() {
  $('#advanced-user-interactions-weekly').show();
  $('#advanced-user-interactions-daily').hide();
});

