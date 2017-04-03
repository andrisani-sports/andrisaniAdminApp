function stamplayEmailFieldDirective(){

	function controller($scope,$rootScope){
		$scope.$watch('entry.values.publicEmail',function(newVal,oldVal){
			$scope.entry.values['email'] = newVal;
		});
	}

	return {
        restrict: 'E', // bind to attribute of element?
        controller: controller,
        link: function(scope,element,attrs){
        	var config = scope.field;
        },
    	template: ''
    }
	
}

stamplayEmailFieldDirective.$inject = [];

export default stamplayEmailFieldDirective;