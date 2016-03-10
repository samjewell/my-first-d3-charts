var response = {
  "gbp": {
    "daily": {
      "data": [{
        bucket_name: "2016-03-09",
        used: 0.9,
        will_use: 0,
        uk_ave: 1.3
      }, {
        bucket_name: "2016-03-10",
        used: 0.2,
        will_use: 0.6,
        uk_ave: 1.2
      }, {
        bucket_name: "2016-03-11",
        used: 0,
        will_use: 1.1,
        uk_ave: 1.5
      }],
      "series_labels": [
        "DATE - DO NOT RENDER THIS STRING",
        "You have spent",
        "Your expected usage",
        "UK Average"
      ],
      "y_label": "Pounds (£)"
    },
    "weekly": {
      "data": [
        [
          "2016-03-03",
          6.3,
          0,
          9.1
        ],
        [
          "2016-03-10",
          1.6,
          4.0,
          8.4
        ],
        [
          "2016-03-17",
          0,
          7.6,
          10.2
        ]
      ],
      "series_labels": [
        "DATE - DO NOT RENDER THIS STRING",
        "You have spent",
        "Your expected usage",
        "UK Average"
      ],
      "y_label": "Pounds (£)"
    }
  }
};

var data = response.gbp.daily.data;

var HIGH = 250;
var WIDE = 500;

// leave 50px all around for axes
var XMIN = 50;
var XMAX = 450;

var YMIN = 50;
var YMAX = 200;

var PAD_COLUMNS = 30;

// simplify this
// var maxY = d3.max(data[2].slice(1), function(elem, index) {
//   var data = elem;

//   return data;
// });
var maxY = 1.5;

// ------------- d3 starts here -------------
// Bars example from http://square.github.io/intro-to-d3/examples/
var y = d3.scale.linear()
  .domain([0, maxY])
  .range([YMAX, YMIN]);

var x = d3.scale.ordinal()
  .domain(data.map(function(el) {
    return el.bucket_name;
  }))
  .rangeRoundBands([XMIN, XMAX]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom')
  .ticks(data.length - 1);

var yAxis = d3.svg.axis()
  .scale(y)
  .orient('left')
  .ticks(5);

var svg = d3.select('#bar')
  .append('svg')
  .attr('width', WIDE)
  .attr('height', HIGH);

svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0, ' + y(0) + ')')
  .call(xAxis);

svg.append('g')
  .attr('class', 'y axis')
  .attr('transform', 'translate(' + XMIN + ', 0)')
  .call(yAxis);

var rects = svg.selectAll('rect')
  .data(data);

var newRects = rects.enter();


newRects.append('rect')
  .attr('y', function(datum, i) {
    return y(datum.used);
  })
  .attr('x', function(datum, i) {
    return x(datum.bucket_name) + PAD_COLUMNS / 2;
  })
  .attr('width', x.rangeBand() - PAD_COLUMNS)
  .attr('height', function(datum, i) {
    // maxY = £1.50
    // used = £0.50
    // range of y is from 200px (0) to 50px (1.5)
    // y(0) = 200px
    // y(0.5) = 150px
    // y(0.5) - y(0) = 150 - 200 = -50
    // Math.abs(-50) = 50 <- this is the correct height!
    return Math.abs(y(datum.used) - y(0));
  });
















// //
