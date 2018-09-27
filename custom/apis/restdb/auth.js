module.exports = function(myApp) {

	myApp.config(function(RestangularProvider){

		RestangularProvider.setDefaultHeaders({
	        "Content-Type": 'application/json',
			"x-apikey": "5bac2705bd79880aab0a778e",
			'cache-control': 'no-cache'
	    });

	})

}