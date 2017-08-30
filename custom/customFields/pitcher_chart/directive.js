// this is an alternative approach: https://github.com/willsoto/angular-chartist.js

function pitcherChartDirective(Restangular){

  var options = {
    width: '600px',
    height: '350px',
    axisX: { },
    axisY: { }
  }

  function controller(){

  }

  function link(scope,attrs,element){
    // Chartist is available here
    var pitcher = scope.entry.values.plain();

    var pitcherId = [];
    pitcherId.push(pitcher.id);

    var data = {
      pitcher: pitcherId
    }
    Restangular.one('pitching_data').get(data)
    .then(function(result){
      result = result.data.plain();

///////////////////////////////////////////////////
// get the injuries for this pitcher from Stamplay
// add an asterisk to labels list for each date with an injury
// (add a column for date of injury if no pull for that date)
///////////////////////////////////////////////////

      var chartDataTop = [];
      var chartDataBottom = [];
      var chartLabels = [];
      var datesList = [];
      var currDate;
      var temp;

      // make an array of unique dates
      for(var i in result){
        if(result[i]['originalPullTimestamp']){
          temp = new Date(result[i]['originalPullTimestamp']);
          temp = (temp.getMonth()+1) + '/' + temp.getDate() + '/' + temp.getFullYear();
          currDate = temp;
          if(datesList.indexOf(currDate) < 0)
            datesList.push(currDate);
        }
      }

      chartLabels = angular.copy(datesList);

      for(var i in datesList)
        datesList[i] = new Date(datesList[i]);

      // sort the list of dates
      datesList.sort(function(a,b){
        return a - b;
      });

      for(var i in chartLabels){
        var temp = [];
        result.map(function(e){
          if(e.originalPullTimestamp){
            var tempDate = new Date(e.originalPullTimestamp);
            tempDate = (tempDate.getMonth()+1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
            if(tempDate == chartLabels[i]){
              temp.push(e.mainValue);
            }
          }
        });
        if(temp.length == 1){
          temp[1] = temp[0];
        }
console.log('temp',temp);
        chartDataTop.push(temp[0]);
        chartDataBottom.push(temp[1]);
      }

      var dataSetting = { labels: chartLabels, series: [[]] };
      var targetDiv = '#pitcher-chart';
      var charts = {};

      charts[targetDiv] = new Chartist.Line(targetDiv, dataSetting, options);

      charts[targetDiv].data.series.push([]); // add a series
      charts[targetDiv].data.series[0] = chartDataTop;
      charts[targetDiv].data.series[1] = chartDataBottom;
      charts[targetDiv].update();

      // setTimeout(function(){
      //   var points = document.getElementsByClassName('ct-point')
      //   for(var i = 0; i < points.length; i++)
      //     points[i].addEventListener('click', clickHandler);
      // }, 300);

    })
    .catch(function(error){
console.log('error',error);
    });
  }

  return {
  restrict: 'EA',
  controller: controller,
  link: link,
  template: `<div>
      <style>
        .ct-label.ct-horizontal { position: relative; transform: rotate(45deg); transform-origin: left top; color: black !important;font-weight: 600; font-size: 10px;}
        .ct-series-a .ct-line, .ct-series-a .ct-point{
          stroke: #fff !important; /*#0CC162;*/
        }
        .ct-series-b .ct-bar, .ct-series-b .ct-line, .ct-series-b .ct-point, .ct-series-b .ct-slice-donut {
          stroke: #BBBBBB;
        }
      </style>
      <div id="pitcher-chart" class="ct-chart ct-perfect-fourth"></div>
    </div>`
  }

}

pitcherChartDirective.inject = ['Restangular'];

export default pitcherChartDirective;