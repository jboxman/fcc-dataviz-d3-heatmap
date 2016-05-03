/*
User Story: I can view a heat map with data represented both on the Y and X axis.

User Story: Each cell is colored based its relationship to other data.

User Story: I can mouse over a cell in the heat map to get more exact information.

https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json
*/

// https://dl.dropboxusercontent.com/s/u5uz5eoftjaz7ir/global-temperature.json?dl=0

var margin = {
    top: 10,
    right: 20,
    bottom: 80,
    left: 50
  },
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom,
  $svg,
  $tooltip,
  $chart,
  xScale,
  yScale,
  heatScale,
  xAxis,
  yAxis,
  tmpl,
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthsObj = Array.prototype.map.call(months, (v, i) => ({
    val: (i + 1),
    key: v
  }));

$svg = d3.select('#chart').append('svg');
$toolTip = d3.select('.tooltip');
tmpl = $.templates('#tmpl');

$svg.attr({
  width: width + margin.left + margin.right,
  height: height + margin.top + margin.bottom
});
$chart = $svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

heatScale = d3.scale.quantile();
// The last element is a placeholder as it seems quantile is not the best choice for heatmap colors.
heatScale.range(['#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61', '#E06D43', '#D53E4F', '#9E0142', '#FFFFFF']);

xScale = d3.scale.linear();
xScale.range([0, width]);
//xScale.rangeRoundBands([0, width], 0.05);

// Derived from
// http://jsfiddle.net/NikhilS/3hgra/
yScale = d3.scale.ordinal();
yScale.domain(monthsObj.map(v => (v.val)));
yScale.rangeRoundBands([0, height], 0.05);

// Define the scale painted upon the chart
xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(function(v) {
  return v;
});
yAxis = d3.svg.axis().scale(yScale).orient('left').tickFormat(function(v) {
  return months[v - 1];
});

//$chart.selectAll('.colors').enter().data()

d3.json('https://dl.dropboxusercontent.com/s/u5uz5eoftjaz7ir/global-temperature.json?dl=0', function(err, data) {
  var vals = data.monthlyVariance,
      baseTemp = data.baseTemperature,
        yearsWidth = vals.length / 12;

  xScale.domain(d3.extent(vals, (v) => (v.year)));

  heatScale.domain([d3.min(vals, (v) => (v.variance)), d3.max(vals, (v) => (v.variance))]);

  // Label text positioning borrowed from:
  // http://bl.ocks.org/mbostock/3887118
  $chart.append('g').attr({
    class: 'x',
    transform: 'translate(0,' + height + ' )'
  }).call(xAxis);

  $chart.append('g').attr({
    class: 'y',
  }).call(yAxis);

  // Technique borrowed from
  // http://figurebelow.com/d3/wp-d3-and-day-hour-heatmap/

  // TODO
  // Use http://data-map-d3.readthedocs.io/en/latest/steps/step_14.html
  // heatScale.domain()[1]; for right most value of scale...
  var $legend = $chart.selectAll('.legend')
    .data(heatScale.quantiles())
    .enter().append('g')
    .attr('class', 'legend');

  $legend.append('rect')
    .attr('x', function(v, i) {
      return (width / heatScale.quantiles().length) * i
    })
    .attr('y', height + 30)
    .attr('width', (width / heatScale.quantiles().length))
    .attr('height', 10)
    .style('fill', function(v, i) {
      return heatScale.range()[i]
    });

  $legend.append('text').attr({
    class: 'legend-text',
    x: function(v, i) {
      return (width / heatScale.quantiles().length) * i
    },
    y: height + 60
  }).text(v => (d3.format('0.2f').call(null, v)));

  var cell = $chart.selectAll('.box')
    .data(vals)
    .enter()
    .append('rect')
    .attr({
      class: 'box',
      width: (width / yearsWidth),
      height: (yScale.rangeBand()),
      x: function(v) {
        return xScale(v.year)
      },
      y: function(v) {
        return yScale(v.month)
      }
    })
    .style('fill', function(v) {
      return heatScale(v.variance)
    });

  // Derived from:
// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
cell.on({
  'mouseover':function(v) {
      // This has to be the basetemp value plus or minus the variance!
    var o = {year:v.year, month:v.month, abstemp:(baseTemp+v.variance), variance:v.variance};
    console.log(o);
    $toolTip.html(tmpl.render({year:v.year, month:v.month, abstemp:(baseTemp+v.variance), variance:v.variance}));
    $toolTip.transition().duration(200).style('opacity', .9);
    $toolTip.style({
      'left': (d3.event.pageX) + "px",
      'top': (d3.event.pageY - 28) + "px"
    });
  },
  'mouseout':(v) => {$toolTip.transition().style('opacity', 0);}
});
});