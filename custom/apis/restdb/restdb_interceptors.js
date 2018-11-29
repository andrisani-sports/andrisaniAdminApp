module.exports = function(myApp) {

	/*******************************************
	 * request RESTANGULAR INTERCEPTOR FUNCTIONS
	 *******************************************/

	myApp.config(function(RestangularProvider,$httpProvider) {
  
	    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, 
	        headers, params, httpConfig) {

	        // console.log('url',angular.copy(url));
	        // console.log('element: ',element);
	        // console.log('operation: ',operation);
	        // console.log('what: ',what);
	        // console.log('headers: ',headers);
	        // console.log('params: ',params);
	        // console.log('httpConfig',httpConfig);

	        /*
	         * FIX ISSUES FOR STAMPLAY API
	         */

	        if (operation == 'getList') {
	            // FIX PAGINATION
				// NgAdmin automatically adds these pagination parameters to a query: _page, _perPage, 
				// _sortField, _sortDir. Map those fields to the right query for RestDB
				// -------
				// REST DB
				// -------
				// sort	= add multiple fields by simply adding another sort parameter. Default: sort=_id
				// Example: https://mydb-fafc.restdb.io/rest/people?q={}&sort=lastname
				// dir = allowed values are 1 (ascending) and -1 (descending). Used together with sort. 
				// Multiple dir parameters can be used in conjunction with sort.
				// Example: https://mydb-fafc.restdb.io/rest/people?q={}&dir=-1
				// skip = here to start in the result set
				// Example: https://mydb-fafc.restdb.io/rest/people?skip=100
				// max = Maximum number of records retrieved.
				// Example: https://mydb-fafc.restdb.io/rest/people?max=20
				// totals = &totals=true returns an object with both data and total count. Totals equals to max parameter or default 1000
				// Example: output from query ->{data: [ … ], totals: { total: 100, count: 40, skip: 0, max: 1000}}

				if(params._page){
					if(!params.skip){
						params.skip = (params._page - 1) * params._perPage;
					}
				}
	            if(!params.per_page){
	                params.per_page = params._perPage;
	            }
	            if(params._sortField){
	                params.sort = params._sortField;
				}
				if(params._sortDir == 'DESC'){
					params.dir = '-1';
				}else{
					params.dir = '1';
				}

	            delete params._page;
	            delete params._perPage;
	            delete params._sortField;
	            delete params._sortDir;
	        }

	        return { element: element, params: params };
	    });


	/***************************************
	 * request POST-RESTANGULAR INTERCEPTOR FUNCTIONS
	 ***************************************/
	    
	    // USING 'unshift' TO RUN THESE FUNCTIONS FIRST (after the Restangular interceptor)!!!!
	    $httpProvider.interceptors.unshift(addContentTypeToHeader);

	    // these functions run in regular order (after Restangular interceptors)
	    $httpProvider.interceptors.push(fixReqIssues);


	    /*
	     * FIX ISSUES FOR STAMPLAY API
	     */

	    // Angular removes the header 'Content-Type' if request is GET.
	    // This function is a hack to add the header back in, because RestDB 
	    // requires the header.
	    function addContentTypeToHeader() {
	        return {
	            request : requestInterceptor
	        };

	        function requestInterceptor(config) {
	            if (angular.isDefined(config.headers['Content-Type']) && !angular.isDefined(config.data))
	                config.data = '';

	            return config;
	        }
	    }

	    function fixReqIssues($q) {
	        return {
	            request : function(config) {

					config = angular.copy(config);
				
				/**
				 * POST
				 */
	                if(config.method == 'POST'){
	                	for(var i in config.data){
	                		if(config.data[i] === null){
	                			// config.data[i] = '';
	                			delete config.data[i];
	                		}
	                	}
	             		if(config && config.data && config.data.zones_arr){
	             			var zones = config.data.zones_arr;
	             			for(var i in zones){
	             				if(typeof zones[i] == 'object'){
	             					zones[i] = JSON.stringify(zones[i]);
	             				}
	             			}
	             		}
	             		
	                }
				
				/**
				 * PUT
				 */
	                // When NG-Admin does a list GET, it receives all fields for 
					// that data model, including the RestDB system fields, and 
					// those fields persist in the dataStore even if the editionView 
					// only defines a couple of fields. 
	                // Which means that the un-editable fields in RestDB must be 
	                // removed before doing a PUT
	                if(config.method === 'PUT'){

	                	if(config.data){
	                		for(var i in config.data){
		                		if(config.data[i] === null){
		                			// this is a temporary fix, need to 
		                			// make it more stable
		                			if(i == 'featureVideo')
		                				config.data[i] = [];
		                			else
		                				config.data[i] = '';
		                		}
		                		if(typeof config.data[i] == 'undefined'){
		                			delete config.data[i];
		                		}
		                	}
	                	}

	                	// zones_arr is an array of strings in RestDB (?), needs
	                	// processing (?)
	                	if(config.data && config.data.zones_arr){
	             			var zones = config.data.zones_arr;
	             			for(var i in zones){
	             				if(typeof zones[i] == 'object'){
	             					zones[i] = JSON.stringify(zones[i]);
	             				}
	             			}
	             		}

	             		// if this is for a file upload
	                	if(config.file){
	                		// PLACEHOLDER FOR FUTURE CODE
	                	}else{
							// RESTDB SYSTEM FIELDS
							// _created, _changed, _createdby, changedby, _id, _parent_id, _version
		                    delete config.data.__version;
		                    delete config.data._id;
							delete config.data._created;
							delete config.data._createdby;
							delete config.data._changed;
							delete config.data._changedby;
							delete config.data._parent_id;
	                	}
	                }

				/**
				 * GET
				 */
	                // translate NGAdmin filter(s) to RestDB format
	                if(config.method == 'GET' && config.params){
	                    var where = {};

	                    // hack to fix an NGA problem: when using 'referenced_list', 
	                    // [object Object] appears in url
	                    if(config.params._filters && '[object Object]' in config.params._filters){
	                        var temp = config.params._filters['[object Object]'];
	                        delete config.params._filters['[object Object]'];
	                        where.chatRoomId = temp; // RestDB uses a straight key:value pair in GET (?)
	                    }

	                    if(config.params._filters){
	                        var obj = config.params._filters;
	                        for(var key in obj){
	                        	// for Stamplay, need to wrap a mongoId in 
	                        	if(obj[key]){
	                        		var value = obj[key];
	                        		var mongoId = value.search(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i) > -1 ? true : false;
	                        	
	                        		if(key == 'dt_create' || key == 'dt_modify'){
	                            
		                                where[key] = {"$gte": obj[key]}; // TODO make this work
		                                //where[key] = new Date(obj[key]); 
		                            
		                            }else if(mongoId){
		                            	// 'referenced_list' sends the foreign key in config.params._filters
		                    			// but it should be in config.params for Stamplay
		                            	// where[key] = {"$regex": "[" + obj[key] + "]", "$options": 'i'};
		                           // config.params[key] = value;
		                        		config.params['populate'] = 'true';
		                        	}else{
		                            
		                                if(obj[key] != ''){
		                                	where[key] = {"$regex": obj[key], "$options": 'i'};
		                                }
		                            
		                            }
	                        	}
	                            
	                            delete config.params._filters[key];
	                        }
	                    }

	                    // if all the previous fixes have emptied the NGA filter object, 
	                    // then delete it
	                    if(isEmpty(config.params._filters)){
	                        delete config.params._filters;
	                    }

	                    // if there are where queries, add to parameters
	                    if(!angular.equals(where,{})){
	                    	config.params.where = where;
	                    }

	                }

// // TRYING TO GET REFERENCES TO WORK IN SITUATIONS MODEL
// // the code below makes a reference field (page in situations) to 
// // have [Object object] instead of the record id
// if(config.method == 'GET' && config.params)
// 	config.params.populate = 'true';
// else if(config.method == 'GET' && !config.params){
// 	config.params = {populate: 'true'};
// }

	                return config || $q.when(config);
	            }
	        };
	    }

	    // from http://stackoverflow.com/questions/4994201/is-object-empty
	    // Speed up calls to hasOwnProperty
	    var hasOwnProperty = Object.prototype.hasOwnProperty;

	    function isEmpty(obj) {

	        // null and undefined are "empty"
	        if (obj == null) return true;

	        // Assume if it has a length property with a non-zero value
	        // that that property is correct.
	        if (obj.length > 0)    return false;
	        if (obj.length === 0)  return true;

	        // If it isn't an object at this point
	        // it is empty, but it can't be anything *but* empty
	        // Is it empty?  Depends on your application.
	        if (typeof obj !== "object") return true;

	        // Otherwise, does it have any properties of its own?
	        // Note that this doesn't handle
	        // toString and valueOf enumeration bugs in IE < 9
	        for (var key in obj) {
	            if (hasOwnProperty.call(obj, key)) return false;
	        }

	        return true;
	    }


	/********************************************
	 * response RESTANGULAR INTERCEPTOR FUNCTIONS
	 ********************************************/

	    RestangularProvider.addResponseInterceptor(function(data,operation,what,url,response,deferred){

			var newResponse = response.data;

			if(newResponse.length){
				for(var i in newResponse){
					newResponse[i].id = newResponse[i]._id;
				}
			}else{
				newResponse.id = newResponse._id;
			}

	        return newResponse;

	    });

	});

}