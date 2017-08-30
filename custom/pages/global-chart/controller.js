function globalChartController($stateParams, notification, $scope, $rootScope, Restangular, $timeout, $q) {
    
    // notification is the service used to display notifications on the top of 
    // the screen
    this.notification = notification;

    // Instantiate variables
    $scope.rawPitchingData = [];
    var chartData;
    var chartLabels = [];

    // Setup chart
    var options = {
        axisX: { },
        axisY: { }
    }

    function getPitcherData(){
    	Restangular.one('pitching_data')
    	.get()
		.then(function(result){
			var temp = result.plain();
            var tempArr = [];
            var datesArr = [];
            var pitchersArr = [];

            for(var i in temp){
                if( temp[i].originalPullTimestamp 
                    && temp[i].pitcher.length > 0)
                    tempArr.push(temp[i]);
            }

			// get master list of dates
            for(var i in tempArr){
                var currDate = tempArr[i].originalPullTimestamp;
                currDate = new Date(currDate);
                currDate = (currDate.getMonth()+1) + '/' + currDate.getDate() + '/' + currDate.getFullYear();
                if(datesArr.indexOf(currDate) < 0)
                    datesArr.push(currDate);
            }
            datesArr = datesArr.map(function(e){return new Date(e);});
            datesArr.sort(function(a,b){return a > b;});
            datesArr = datesArr.map(function(e){
                return (e.getMonth()+1) + '/' + e.getDate() + '/' + e.getFullYear();
            });

            // group data by pitchers
            for(var i in tempArr){
                var currPitcher = tempArr[i].pitcher[0];
                if(pitchersArr.indexOf(currPitcher) < 0)
                    pitchersArr.push(currPitcher);
            }
console.log('pitchersArr',pitchersArr);
            // group pitcher data by dates
            // get series (2 entries in series per pitcher, one value 
            // per series entry per master timestamp array)
            for(var i in tempArr){

/////////////////////////////// FINISH
            
            }
		})
		.catch(function(error){
			return false;
		});
    };

    getPitcherData();

    // Instantiate the chart
    var dataSetting = { labels: chartLabels, series: [[]] };
    var targetDiv = '#global-chart';
    var charts = {};

    charts[targetDiv] = new Chartist.Line(targetDiv, dataSetting, options);

    charts[targetDiv].data.series.push([]); // add a series
    for(var i in chartData){
        charts[targetDiv].data.series.push(chartData[i]);
    }
    charts[targetDiv].update();

};

globalChartController.inject = ['$stateParams', 'notification', '$scope', '$rootScope', 'Restangular', '$timeout', '$q'];

export default globalChartController;