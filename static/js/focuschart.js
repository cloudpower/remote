
function plotLineChartWithFocus(data){

    nv.addGraph(function() {
      var chart = nv.models.lineWithFocusChart()
                    .color(d3.scale.category10().range());

      chart.xAxis
          .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
      chart.x2Axis
          .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });

      chart.yAxis
          .tickFormat(d3.format(',.2f'));
      chart.y2Axis
          .tickFormat(d3.format(',.2f'))

      chart.forceY([0]); // force range of y axis
      
      chart.xAxis.rotateLabels(-45);
      chart.x2Axis.rotateLabels(-45);
      
      chart.height(550);
      chart.height2(150);
      
      chart.margin2({top: 50, right: 30, bottom: 20, left: 60});


      d3.select('#chart svg')
          .datum(formatData(data))
        .transition().duration(500)
          .call(chart);

      nv.utils.windowResize(chart.update);
      window.chart = chart;
      return chart;
    });

    function formatData(data) {


      var result = [];
      var tempTime,
          deviceNames = Object.getOwnPropertyNames(data);
      for (var nDev = 0; nDev < deviceNames.length; nDev++){
        
        var socket1 = [],  
            socket2 = [];

        for (var i = 0; i < data[deviceNames[nDev]].socket1.length; i++) {
          tempTime = new Date(data[deviceNames[nDev]].timestamp[i]).getTime();
          socket1.push({x: tempTime, y: data[deviceNames[nDev]].socket1[i]});
          socket2.push({x: tempTime, y: data[deviceNames[nDev]].socket2[i]});
        }

        result.push({
          values: socket1,
          key: "Device: " + deviceNames[nDev] + " Socket #1",
        });
        result.push({
          values: socket2,
          key: "Device: " + deviceNames[nDev] + " Socket #2",
        });

      }
      
      return result;
    }

}


