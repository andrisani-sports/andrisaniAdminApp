function globalChartButtonDirective($location){

	function controller(){ }

	return {
        restrict: 'E', // bind to attribute of element?
        controller: controller,
        link: function(scope,element,attrs){
        	scope.goToChartPage = function () {
                $location.path('/global-chart/'); // + scope.post().values.id
            }; 
        }, 
    	template: '<a class="btn btn-default btn-sm" ng-click="goToChartPage()">Global Chart</a>'
    }
	
}

globalChartButtonDirective.$inject = ['$location'];

export default globalChartButtonDirective;