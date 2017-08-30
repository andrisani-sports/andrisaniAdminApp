function uploadExcelButtonDirective($location,$rootScope,$state){

	function controller(){ }

	return {
        restrict: 'E', // bind to attribute of element?
        controller: controller,
        link: function(scope,element,attrs){
        	scope.goToUploadPage = function () {
                // $location.path('/upload-excel/');
                $state.go('upload-excel');
            }; 
        },
    	template: '<a class="btn btn-default btn-sm" type="button" ng-click="goToUploadPage()">Upload Excel</a>'
    }

}

uploadExcelButtonDirective.$inject = ['$location','$rootScope','$state'];

export default uploadExcelButtonDirective;