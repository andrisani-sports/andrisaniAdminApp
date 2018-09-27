module.exports = function(myApp) {

	myApp.config(function(RestangularProvider){

		// RESTDB API KEY (for header)
		// api_key: 9fb2b0423137fd19e37069f1fd6e717f43f2f

		// STAMPLAY 
		// http://kpadmin-jwt
	    var url = window.location.origin;
	    var token = window.localStorage.getItem(url + "-jwt");
    
	    if(typeof token == 'object' && token == null){
	        token = '';
	    }else{
	        token = token.replace(/"/g,'');
	        token = token.toString();
	    }

	    RestangularProvider.setDefaultHeaders({
	        "Content-Type": 'application/json; charset=utf-8',
	        "x-stamplay-jwt": token
	    });

	})

}