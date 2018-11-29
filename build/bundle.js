(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = function (myApp) {

	myApp.config(function (RestangularProvider) {

		RestangularProvider.setDefaultHeaders({
			"Content-Type": 'application/json',
			"x-apikey": "5bac2705bd79880aab0a778e",
			'cache-control': 'no-cache'
		});
	});
};

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (myApp) {

	/*******************************************
  * request RESTANGULAR INTERCEPTOR FUNCTIONS
  *******************************************/

	myApp.config(function (RestangularProvider, $httpProvider) {

		RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {

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

				if (params._page) {
					if (!params.skip) {
						params.skip = (params._page - 1) * params._perPage;
					}
				}
				if (!params.per_page) {
					params.per_page = params._perPage;
				}
				if (params._sortField) {
					params.sort = params._sortField;
				}
				if (params._sortDir == 'DESC') {
					params.dir = '-1';
				} else {
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
				request: requestInterceptor
			};

			function requestInterceptor(config) {
				if (angular.isDefined(config.headers['Content-Type']) && !angular.isDefined(config.data)) config.data = '';

				return config;
			}
		}

		function fixReqIssues($q) {
			return {
				request: function request(config) {

					config = angular.copy(config);

					/**
      * POST
      */
					if (config.method == 'POST') {
						for (var i in config.data) {
							if (config.data[i] === null) {
								// config.data[i] = '';
								delete config.data[i];
							}
						}
						if (config && config.data && config.data.zones_arr) {
							var zones = config.data.zones_arr;
							for (var i in zones) {
								if (_typeof(zones[i]) == 'object') {
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
					if (config.method === 'PUT') {

						if (config.data) {
							for (var i in config.data) {
								if (config.data[i] === null) {
									// this is a temporary fix, need to 
									// make it more stable
									if (i == 'featureVideo') config.data[i] = [];else config.data[i] = '';
								}
								if (typeof config.data[i] == 'undefined') {
									delete config.data[i];
								}
							}
						}

						// zones_arr is an array of strings in RestDB (?), needs
						// processing (?)
						if (config.data && config.data.zones_arr) {
							var zones = config.data.zones_arr;
							for (var i in zones) {
								if (_typeof(zones[i]) == 'object') {
									zones[i] = JSON.stringify(zones[i]);
								}
							}
						}

						// if this is for a file upload
						if (config.file) {
							// PLACEHOLDER FOR FUTURE CODE
						} else {
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
					if (config.method == 'GET' && config.params) {
						var where = {};

						// hack to fix an NGA problem: when using 'referenced_list', 
						// [object Object] appears in url
						if (config.params._filters && '[object Object]' in config.params._filters) {
							var temp = config.params._filters['[object Object]'];
							delete config.params._filters['[object Object]'];
							where.chatRoomId = temp; // RestDB uses a straight key:value pair in GET (?)
						}

						if (config.params._filters) {
							var obj = config.params._filters;
							for (var key in obj) {
								// for Stamplay, need to wrap a mongoId in 
								if (obj[key]) {
									var value = obj[key];
									var mongoId = value.search(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i) > -1 ? true : false;

									if (key == 'dt_create' || key == 'dt_modify') {

										where[key] = { "$gte": obj[key] }; // TODO make this work
										//where[key] = new Date(obj[key]); 
									} else if (mongoId) {
										// 'referenced_list' sends the foreign key in config.params._filters
										// but it should be in config.params for Stamplay
										// where[key] = {"$regex": "[" + obj[key] + "]", "$options": 'i'};
										// config.params[key] = value;
										config.params['populate'] = 'true';
									} else {

										if (obj[key] != '') {
											where[key] = { "$regex": obj[key], "$options": 'i' };
										}
									}
								}

								delete config.params._filters[key];
							}
						}

						// if all the previous fixes have emptied the NGA filter object, 
						// then delete it
						if (isEmpty(config.params._filters)) {
							delete config.params._filters;
						}

						// if there are where queries, add to parameters
						if (!angular.equals(where, {})) {
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
			if (obj.length > 0) return false;
			if (obj.length === 0) return true;

			// If it isn't an object at this point
			// it is empty, but it can't be anything *but* empty
			// Is it empty?  Depends on your application.
			if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== "object") return true;

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

		RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {

			var newResponse = response.data;

			if (newResponse.length) {
				for (var i in newResponse) {
					newResponse[i].id = newResponse[i]._id;
				}
			} else {
				newResponse.id = newResponse._id;
			}

			return newResponse;
		});
	});
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
       value: true
});
function uploadExcelButtonDirective($location, $rootScope, $state) {

       function controller() {}

       return {
              restrict: 'E', // bind to attribute of element?
              controller: controller,
              link: function link(scope, element, attrs) {
                     scope.goToUploadPage = function () {
                            // $location.path('/upload-excel/');
                            $state.go('upload-excel');
                     };
              },
              template: '<a class="btn btn-default btn-sm" type="button" ng-click="goToUploadPage()">Upload Excel</a>'
       };
}

uploadExcelButtonDirective.$inject = ['$location', '$rootScope', '$state'];

exports.default = uploadExcelButtonDirective;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FileField2 = require("admin-config/lib/Field/FileField");

var _FileField3 = _interopRequireDefault(_FileField2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChangeRoleField = function (_FileField) {
    _inherits(ChangeRoleField, _FileField);

    function ChangeRoleField(name) {
        _classCallCheck(this, ChangeRoleField);

        var _this = _possibleConstructorReturn(this, (ChangeRoleField.__proto__ || Object.getPrototypeOf(ChangeRoleField)).call(this, name));

        _this._type = "change_role_dropdown";
        return _this;
    }

    return ChangeRoleField;
}(_FileField3.default);

exports.default = ChangeRoleField;

},{"admin-config/lib/Field/FileField":29}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * This directive is meant to be used inside the Page entity views. For it to work,
 * it has to reference a 'page' Entity
 */
function changeRoleField(Restangular, $log) {

	function controller($scope, $rootScope) {

		var datastore = $scope.datastore;
		var entryId = $scope.entity._uniqueId;
		var currPage = $scope.currPage = datastore.getEntries(entryId)[0];
		var userObj = $scope.userObj = currPage.values.plain();
		var currRoleId = $scope.currRoleId = userObj.givenRole;
		var userId = userObj.id;

		$scope.updateRole = function (choice) {
			var temp = $scope.currChoice;
			var roleId = choice._id;

			// change role in user record on Stamplay
			var url = 'https://pitchingdata.stamplayapp.com/api/user/v1/users/' + userId + '/role';
			var data = {
				'givenRole': roleId
			};
			Restangular.oneUrl('users', url) // userId defined above, outside of function
			.patch(data).then(function (result) {
				var content = result.data.plain();
			}, function (error) {
				$log.error(error);
			});
		};
	}

	return {
		restrict: 'E', // bind to attribute of element?
		controller: controller,
		link: function link(scope, element, attrs) {
			scope.roles = [];
			scope.view = attrs.view;
			if (scope.view == 'show') {
				Restangular.oneUrl('roles', 'https://pitchingdata.stamplayapp.com/api/user/v1/roles/').get({ _id: scope.currRoleId }).then(function (result) {
					result = result.data.plain();
					scope.currRoleName = result[0].name;
				}, function (error) {
					$log.error(error);
				});
			}
			if (scope.view == 'edit') {
				// GET LIST OF ROLES FOR DROPDOWN
				var roleList = Restangular.allUrl('roles', 'https://pitchingdata.stamplayapp.com/api/user/v1/roles');
				roleList.getList().then(function (result) {
					if (scope.currPage._identifierValue) {
						// IN 'EDITION' VIEW
						result = result.data.plain();
						scope.roles = result;
						if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') result = JSON.parse(result);
						scope.currRoleName = '';
						result.map(function (e) {
							if (e._id == scope.currRoleId) scope.currRoleName = e.name;
						});
						scope.currChoice = {
							name: scope.currRoleName,
							_id: scope.currRoleId
						};
					} // END if(viewType == 'edition')
				}, function (error) {
					$log.error(error);
				});
			}
		},
		template: '\n        <p ng-if="view==\'show\'" style="text-transform: capitalize;">{{currRoleName}}</p>\n        <div ng-if="view==\'edit\'">\n\t        <select ng-model="currChoice" \n\t            ng-options="role.name for role in roles track by role._id"\n\t            name="dropdown" \n\t            class="form-control" \n\t            ng-change="updateRole(this.currChoice)">\n\t        </select>\n\t    </div>'
	};
}

changeRoleField.$inject = ['Restangular'];

exports.default = changeRoleField;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    getReadWidget: function getReadWidget() {
        return '<change-user-role field="field" value="value" entity="entity" entry="entry" view="show"></change-user-role>';
    },
    getLinkWidget: function getLinkWidget() {
        return 'error: cannot display file field as linkable';
    },
    getFilterWidget: function getFilterWidget() {
        return 'error: cannot display file field as filter';
    },
    getWriteWidget: function getWriteWidget() {
        return '<change-user-role field="field" value="value" entity="entity" entry="entry" view="edit"></change-user-role>';
    }
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// this is an alternative approach: https://github.com/willsoto/angular-chartist.js

function pitcherChartDirective(Restangular) {

  var options = {
    width: '600px',
    height: '350px',
    axisX: {},
    axisY: {}
  };

  function controller() {}

  function link(scope, attrs, element) {
    // Chartist is available here
    var pitcher = scope.entry.values.plain();

    var pitcherId = [];
    pitcherId.push(pitcher.id);

    var data = {
      pitcher: pitcherId
    };
    Restangular.one('pitching-data').get(data).then(function (result) {
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
      for (var i in result) {
        if (result[i]['originalPullTimestamp']) {
          temp = new Date(result[i]['originalPullTimestamp']);
          temp = temp.getMonth() + 1 + '/' + temp.getDate() + '/' + temp.getFullYear();
          currDate = temp;
          if (datesList.indexOf(currDate) < 0) datesList.push(currDate);
        }
      }

      chartLabels = angular.copy(datesList);

      for (var i in datesList) {
        datesList[i] = new Date(datesList[i]);
      } // sort the list of dates
      datesList.sort(function (a, b) {
        return a - b;
      });

      for (var i in chartLabels) {
        var temp = [];
        result.map(function (e) {
          if (e.originalPullTimestamp) {
            var tempDate = new Date(e.originalPullTimestamp);
            tempDate = tempDate.getMonth() + 1 + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
            if (tempDate == chartLabels[i]) {
              temp.push(e.mainValue);
            }
          }
        });
        if (temp.length == 1) {
          temp[1] = temp[0];
        }
        console.log('temp', temp);
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
    }).catch(function (error) {
      console.log('error', error);
    });
  }

  return {
    restrict: 'EA',
    controller: controller,
    link: link,
    template: '<div>\n      <style>\n        .ct-label.ct-horizontal { position: relative; transform: rotate(45deg); transform-origin: left top; color: black !important;font-weight: 600; font-size: 10px;}\n        .ct-series-a .ct-line, .ct-series-a .ct-point{\n          stroke: #fff !important; /*#0CC162;*/\n        }\n        .ct-series-b .ct-bar, .ct-series-b .ct-line, .ct-series-b .ct-point, .ct-series-b .ct-slice-donut {\n          stroke: #BBBBBB;\n        }\n      </style>\n      <div id="pitcher-chart" class="ct-chart ct-perfect-fourth"></div>\n    </div>'
  };
}

pitcherChartDirective.inject = ['Restangular'];

exports.default = pitcherChartDirective;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TextField2 = require("admin-config/lib/Field/TextField");

var _TextField3 = _interopRequireDefault(_TextField2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // run "npm install admin-config --save-dev"
// need to have a build tool transpile ES6 to regular javascript (browserify / babelify)

var StamplayEmailFieldConfig = function (_TextField) {
    _inherits(StamplayEmailFieldConfig, _TextField);

    function StamplayEmailFieldConfig(name) {
        _classCallCheck(this, StamplayEmailFieldConfig);

        var _this = _possibleConstructorReturn(this, (StamplayEmailFieldConfig.__proto__ || Object.getPrototypeOf(StamplayEmailFieldConfig)).call(this, name));

        _this._type = "stamplay_email_field";
        return _this;
    }
    // this comes from an entity definition file, when the pagezone field type is invoked, this function 
    // can be used in the definition file to pass parameters to this class


    _createClass(StamplayEmailFieldConfig, [{
        key: "sampleFunction",
        value: function sampleFunction(sampleParam) {
            if (!arguments.length) return this._sampleParam;
            this._sampleParam = sampleParam;
            return this;
        }
    }]);

    return StamplayEmailFieldConfig;
}(_TextField3.default);

exports.default = StamplayEmailFieldConfig;

},{"admin-config/lib/Field/TextField":30}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function stamplayEmailFieldDirective() {

  function controller($scope, $rootScope) {
    $scope.$watch('entry.values.publicEmail', function (newVal, oldVal) {
      $scope.entry.values['email'] = newVal;
    });
  }

  return {
    restrict: 'E', // bind to attribute of element?
    controller: controller,
    link: function link(scope, element, attrs) {
      var config = scope.field;
    },
    template: ''
  };
}

stamplayEmailFieldDirective.$inject = [];

exports.default = stamplayEmailFieldDirective;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});
exports.default = {
   // displayed in listView and showView
   getReadWidget: function getReadWidget() {
      return '<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>';
   },
   // displayed in listView and showView when isDetailLink is true
   getLinkWidget: function getLinkWidget() {
      return 'Error: this field not applicable to List view or Show view';
   },
   // displayed in the filter form in the listView
   getFilterWidget: function getFilterWidget() {
      return 'Error: this field not applicable to List view';
   },
   // displayed in editionView and creationView
   getWriteWidget: function getWriteWidget() {
      return '<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>';
   }
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function (admin) {

    // Experimental Error Handler
    function ngaErrorHandler(response, notification) {

        /***************************
         * @TODO combine this function with the function in the other error handler file 
         * @TODO come up with a way to determine what environment the app is in
         * @TODO come up with pretty error messages for end users if in production
         * @TODO push devErrorObj below to api/log if error happens in production
         * @TODO add user information to devErrorObj
         ***************************/

        var humane = require('humane-js');
        var notification = humane.create({ timeout: 5000, clickToClose: true, addnCls: 'humane-flatty-error' });

        var source = '';

        if (response.error) {
            // a generic response from a generic API
            var errorMessage = response.error.message;
            var errorStatus = response.error.status;
            var requestObj = {};
            var responseObj = {};
        } else if (response.data.error) {
            // when the response comes from the Stamplay API
            source = 'Stamplay ';
            var errorMessage = response.data.error.message;
            var errorStatus = response.data.error.status;
            var requestObj = {
                'url': response.config.url,
                'body': response.config.data,
                'method': response.config.method
            };
            var responseObj = {
                'headers': response.headers,
                'data': response.data
            };
        } else {
            var errorMessage = 'Unable to process.';
            var errorStatus = 'Status unknown';
            var requestObj = {};
            var responseObj = {};
        }

        var devErrObj = {
            'status': errorStatus,
            'error_message': errorMessage,
            'request': requestObj,
            'response': responseObj,
            '_original': response
        };

        console.log('ERROR', devErrObj);
        notification.log('Error: ' + errorStatus + ', ' + errorMessage);

        return 'Global ADMIN error: ' + errorStatus + '(' + errorMessage + ')';
    }

    admin.errorMessage(ngaErrorHandler);

    return admin;
};

},{"humane-js":32}],12:[function(require,module,exports){
'use strict';

module.exports = function (myApp) {

		/***************************************
   * CUSTOM ERROR MESSAGES
   ***************************************/

		function errorHandler($rootScope, $state, $translate, notification) {

				/***************************
      	 * @TODO come up with a way to determine what environment the app is in
      	 * @TODO come up with pretty error messages for end users if in production
      	 * @TODO add pushes to api/log if error happens in production
      	 ***************************/

				// delete the NG-Admin default error handler
				delete $rootScope.$$listeners.$stateChangeError;

				$rootScope.$on("$stateChangeError", function handleError(event, toState, toParams, fromState, fromParams, error) {

						console.log('ERROR HANDLER, error', error);
						// console.log('event',event);
						// console.log('toState',toState);
						// console.log('toParams',toParams);
						// console.log('fromState',fromState);
						// console.log('fromParams',fromParams);

						if (error.status == 404) {
								$state.go('ma-404');
								event.preventDefault();
						} else {
								var errorMessage;

								if (error.message) {
										errorMessage = error.message;
								} else if (error.data.error.message) {
										errorMessage = error.data.error.message;
								}

								$translate('STATE_CHANGE_ERROR', { 'message': errorMessage }).then(function (text) {
										return notification.log(text, { addnCls: 'humane-flatty-error' });
								});
								throw error;
						}
				});
		}

		myApp.run(errorHandler);

		myApp.config(['$translateProvider', function ($translateProvider) {
				$translateProvider.translations('en', {
						'STATE_CHANGE_ERROR': 'Error: {{ message }}'
				});
				$translateProvider.preferredLanguage('en');
		}]);

		return myApp;
};

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
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
        axisX: {},
        axisY: {}
    };

    function getPitcherData() {
        Restangular.one('pitching_data').get().then(function (result) {
            var temp = result.plain();
            var tempArr = [];
            var datesArr = [];
            var pitchersArr = [];

            for (var i in temp) {
                if (temp[i].originalPullTimestamp && temp[i].pitcher.length > 0) tempArr.push(temp[i]);
            }

            // get master list of dates
            for (var i in tempArr) {
                var currDate = tempArr[i].originalPullTimestamp;
                currDate = new Date(currDate);
                currDate = currDate.getMonth() + 1 + '/' + currDate.getDate() + '/' + currDate.getFullYear();
                if (datesArr.indexOf(currDate) < 0) datesArr.push(currDate);
            }
            datesArr = datesArr.map(function (e) {
                return new Date(e);
            });
            datesArr.sort(function (a, b) {
                return a > b;
            });
            datesArr = datesArr.map(function (e) {
                return e.getMonth() + 1 + '/' + e.getDate() + '/' + e.getFullYear();
            });

            // group data by pitchers
            for (var i in tempArr) {
                var currPitcher = tempArr[i].pitcher[0];
                if (pitchersArr.indexOf(currPitcher) < 0) pitchersArr.push(currPitcher);
            }
            console.log('pitchersArr', pitchersArr);
            // group pitcher data by dates
            // get series (2 entries in series per pitcher, one value 
            // per series entry per master timestamp array)
            for (var i in tempArr) {

                /////////////////////////////// FINISH

            }
        }).catch(function (error) {
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
    for (var i in chartData) {
        charts[targetDiv].data.series.push(chartData[i]);
    }
    charts[targetDiv].update();
};

globalChartController.inject = ['$stateParams', 'notification', '$scope', '$rootScope', 'Restangular', '$timeout', '$q'];

exports.default = globalChartController;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function globalChartButtonDirective($location) {

  function controller() {}

  return {
    restrict: 'E', // bind to attribute of element?
    controller: controller,
    link: function link(scope, element, attrs) {
      scope.goToChartPage = function () {
        $location.path('/global-chart/'); // + scope.post().values.id
      };
    },
    template: '<a class="btn btn-default btn-sm" ng-click="goToChartPage()">Global Chart</a>'
  };
}

globalChartButtonDirective.$inject = ['$location'];

exports.default = globalChartButtonDirective;

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var globalChartTemplate = "<!--  ROW  -->\n<div class=\"row\">\n\t<div class=\"col-lg-12\">\n\t\t<h1 class=\"page-header\" style=\"font-family: 'Lobster', cursive;color: #7a848e;\">Global Chart</h1>\n    \t<span style=\"display:block;height:20px;width:100%\"></span>\n    \t<div id=\"global-chart\"></div>\n\t</div>\n</div>";

exports.default = globalChartTemplate;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function uploadExcelController($stateParams, notification, $scope, $rootScope, Restangular, $timeout, $q) {

    $rootScope.currPlayerSelected = {};
    $rootScope.teamsList = [];

    $scope.matrix = [];
    $scope.playerChoice = '1';
    $scope.teamChoice = '';
    $scope.currPlayersList = [];
    $scope.playerNumberToIdMap = [];
    $scope.dataForCloud = [];

    // notification is the service used to display notifications on the top of 
    // the screen
    this.notification = notification;

    function getTeams() {
        Restangular.one('teams').get().then(function (result) {
            if (result.data) result = result.data;
            var temp = result.plain();
            $rootScope.teamsList = temp;
        }).catch(function (error) {
            return false;
        });
    };

    getTeams();

    /**
     * UPLOAD FUNCTION (ALSO CLEANS DATA)
     */

    function uploadRead(workbook) {

        function transposeMatrixArr(matrix) {
            return matrix[0].map(function (col, i) {
                return matrix.map(function (row) {
                    return row[i];
                });
            });
        }

        var sheet = workbook.Sheets.Sheet1;
        var letter;
        var matrix = [];
        var matrixObj = {};
        var temp;
        var currPlayer;
        var playerArray = {};

        $scope.playerArray = [];
        $scope.dataForCloud = [];
        $scope.matrix = [];

        // make matrix 
        for (var i in sheet) {
            letter = i.substr(0, 1);
            if (letter != '!') {
                if (!matrixObj[letter]) matrixObj[letter] = [];
                if (sheet[i].w) temp = sheet[i].w;else temp = sheet[i].v;
                matrixObj[letter].push(temp);
            }
        }

        // convert matrix object to 2 dimensional array
        for (var i in matrixObj) {
            matrix.push(matrixObj[i]);
        }

        // get header row
        var headerRow = [];
        for (var column in matrix) {
            headerRow.push(matrix[column][0]);
            matrix[column].splice(0, 1);
        }

        // get rid of unnecessary columns 
        // 1. analyzing the first row of the spreadsheet
        // 2. create a map of labels to array keys, for use below
        var tempMatrix = [];
        var tempArray = new Array(matrix[0].length);
        var matrixMap = [];
        var newIndex;

        if (headerRow[1] == 'Date') {
            headerRow.splice(1, 0, 'Jersey');
            matrix.splice(1, 0, tempArray);
            matrix[1][0] = 'Jersey';
        } else {
            headerRow[1] = 'Jersey';
        }
        for (var key in headerRow) {
            var columnName = headerRow[key];
            if (columnName == 'Player' || columnName == 'Date' || columnName == 'Time' || columnName == 'Strength' || columnName == 'Jersey') {
                newIndex = tempMatrix.push(matrix[key]);
                matrixMap[columnName] = newIndex - 1;
            }
        }

        // add columns for "pulls" and "raw data"
        newIndex = tempMatrix.push(tempArray);
        matrixMap['Pulls'] = newIndex - 1;
        newIndex = tempMatrix.push(tempArray);
        matrixMap['RawData'] = newIndex - 1;

        matrix = angular.copy(tempMatrix);

        // transpose the matrix
        var matrix = transposeMatrixArr(matrix);

        // clean up the data
        var key;
        var tempMatrix = [];

        // merge date and time columns and convert to JS Date object
        for (var i in matrix) {
            key = i;
            if (!tempMatrix[key]) {
                tempMatrix[key] = [];
            }
            temp = matrix[key][matrixMap['Date']] + ' ' + matrix[key][matrixMap['Time']];
            temp = new Date(temp);
            matrix[key][matrixMap['Date']] = temp;
            matrix[key].splice(matrixMap['Time'], 1);
            matrix[key][matrixMap['Pulls']] = 1; // pulls
            // make a pull object
            var pullObj = {
                1: {
                    mainValue: matrix[key][3],
                    rawData: 'none'
                }
            };
            matrix[key][matrixMap['RawData']] = pullObj;
            tempMatrix.push(matrix[key]);
        }
        matrix = angular.copy(tempMatrix);

        $scope.$apply(function () {
            $scope.matrix = matrix;
        });

        // get list of players from matrix
        for (var i in matrix) {
            if (typeof matrix[i][0] != 'undefined') {
                currPlayer = matrix[i][0];
                // add this pitcher number to array for use in view
                if (!(currPlayer in playerArray)) {
                    playerArray[matrix[i][0]] = [];
                }
                // add to array for mapping player id from db to player number
                if (!(currPlayer in $scope.playerNumberToIdMap)) {
                    $scope.playerNumberToIdMap[matrix[i][0]] = '';
                }
                playerArray[matrix[i][0]].push(matrix[i]);
            }
        }

        // delete the first array, because it will be filled with all the blank 
        // cells in the original spreadsheet
        delete playerArray[0];

        // add data to $scope
        $scope.$apply(function () {
            var newData = angular.copy(playerArray);
            $scope.playerArray = playerArray;
            $scope.dataForCloud = newData;
        });
    }

    $scope.uploadRead = uploadRead;

    /**
     * FUNCTIONS FOR BUTTONS ON TEMPLATE
     */

    $scope.choosePlayer = function (number) {
        $scope.playerChoice = number;
    };

    $scope.updatePlayerForData = function (playerNumber) {
        // add the pitcher id to the data being sent to cloud
        var pitcher = $rootScope.currPlayerSelected[playerNumber];
        var id = pitcher.id;
        $scope.playerNumberToIdMap[playerNumber] = id;
    };

    $scope.updatePlayerList = function () {
        var team = $scope.teamChoice;
        var teamId = team.id;
        Restangular.one('pitchers').get({ team: teamId }).then(function (result) {
            if (result.data) result = result.data;
            var temp = result.plain();
            $scope.currPlayersList = temp;
        }).catch(function (error) {
            console.log('error', error);
        });
    };

    $scope.deleteLine = function (pitcherNumber, row, rowKey) {
        $scope.dataForCloud[pitcherNumber].splice(rowKey, 1);
    };

    $scope.mergeLines = function (playerNumber) {
        var mergedData = [];
        var data = angular.copy($scope.dataForCloud[playerNumber]);
        var lastArray;

        for (var i in data) {
            if (!lastArray) {
                lastArray = data[i];
            } else {
                // push the lastArray to new array
                // if current element gets merged
                var temp = data[i][2] - lastArray[2];
                if (temp < 300000) {
                    var averageStrength = (parseFloat(lastArray[3]) + parseFloat(data[i][3])) / 2;
                    console.log('averageStrength', averageStrength);
                    var pullsObj = {
                        1: {
                            mainValue: lastArray[3],
                            rawData: 'none'
                        },
                        2: {
                            mainValue: data[i][3],
                            rawData: 'none'
                        }
                    };
                    lastArray[5]++;
                    lastArray[3] = averageStrength;
                    lastArray[6] = pullsObj;
                    data.splice(i, 1);
                }
                console.log('lastArray', lastArray);
                mergedData.push(lastArray);
                lastArray = data[i];
            }
        }
        $scope.dataForCloud[playerNumber] = mergedData;
    };

    $scope.undoProcessing = function (playerNumber) {
        $scope.dataForCloud[playerNumber] = angular.copy($scope.playerArray[playerNumber]);
    };

    $scope.uploadError = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
    };

    $scope.uploadToCloud = function (playerNumber) {

        // CHECK: has pitcher been selected in dropdown?
        if ($scope.playerNumberToIdMap[playerNumber] == '') {
            notification.log('need to choose a pitcher');
            return false;
        }

        var promises = [];
        var dataArray = $scope.dataForCloud[playerNumber];

        var pitcherId = [];
        pitcherId.push($scope.playerNumberToIdMap[playerNumber]);

        // CHECK: see if lines already saved
        var getForPitcher = { pitcher: pitcherId };
        Restangular.one('pitching-data').get(getForPitcher).then(function (result) {
            result = result.plain();

            var uploaded = 0;
            var notUploaded = 0;
            for (var i in dataArray) {
                var doNotUpload = false;
                for (var j in result) {
                    if (result[j]['originalPullTimestamp'] && doNotUpload == false) {
                        var tempDate = new Date(result[j]['originalPullTimestamp']);
                        if (dataArray[i][1].getTime() == tempDate.getTime()) doNotUpload = true;
                    }
                }
                if (doNotUpload) {
                    notUploaded++;
                } else {
                    uploaded++;
                    var data = {
                        mainValue: parseFloat(dataArray[i][3]).toString(),
                        originalPullTimestamp: dataArray[i][1],
                        pitcher: pitcherId,
                        pulls: dataArray[i][5]
                    };
                    promises.push(Restangular.all('pitching-data').customPOST(data));
                }
            }
            // notification.log(uploaded + ' were uploaded, ' + notUploaded + ' were not uploaded.');
            $q.all(promises).then(function (result) {
                // result contains array of all objects saved in api backend (as Restangular objects)
                // to get just the data, on each result do:
                //   var line = result[0].plain();
                notification.log(uploaded + ' were uploaded, ' + notUploaded + ' were not uploaded.');
            });
        });
    };
};

uploadExcelController.inject = ['$stateParams', 'notification', '$scope', '$rootScope', 'Restangular', '$timeout', '$q'];

exports.default = uploadExcelController;

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var uploadExcelTemplate = "<!--  ROW  -->\n<div class=\"row\">\n\t<div class=\"col-lg-12\">\n    \t<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>\n    \t<div class=\"page-header\">\n        \t<h1>Data in Excel</h1>\n    \t</div>\n\t</div>\n</div>\n\n<!--  ROW  -->\n<div class=\"row\" style=\"margin-bottom: 20px;\">\n\t<div class=\"col-md-5\">\n\t\t<span style=\"font-weight: 700;\">1. Choose Team</span>\n\t\t<br/>\n\t\t<select \n\t\t\tng-model=\"teamChoice\"\n\t\t\tname=\"teamList\"\n\t\t\tng-change=\"updatePlayerList()\"\n\t\t\tng-options=\"option.name for option in $root.teamsList track by option.id\"\n\t\t>\n\t\t</select>\n\t</div>\n    <div class=\"col-md-6\">\n    \t<span style=\"font-weight: 700;\">2. Upload Worksheet </span>\n    \t<js-xls onread=\"uploadRead\" onerror=\"uploadError\"></js-xls>\n    </div>\n</div>\n\n<!--  ROW  -->\n<div class=\"row\">\n    <div class=\"col-lg-12\">\n    \t<h4>Data for upload to cloud</h4>\n    \t<ul class=\"nav nav-pills\">\n\t\t  <li ng-repeat=\"(playerNumber,playerData) in playerArray\" ng-class=\"{active: playerNumber == playerChoice}\">\n\t\t  \t<a ng-click=\"choosePlayer(playerNumber)\" style=\"background-color:#1A6199;\">Player {{playerNumber}}</a>\n\t\t  </li>\n\t\t</ul>\n\t\t<div class=\"tab-content\" style=\"margin-top: 20px;overflow:auto;\">\n\t\t\t<div ng-if=\"!playerArray\">NO DATA FOUND YET</div>\n\t\t  \t<div ng-repeat=\"(number,playerData) in playerArray\" id=\"player{{playerNumber}}\" ng-show=\"playerChoice == number\">\n\t\t\t\t<div class=\"col-lg-6\">\n\t\t\t\t\t<h4>Raw data from Excel worksheet</h4>\n\t\t\t    \t<table class=\"table table-striped table-bordered\">\n\t\t\t    \t\t<thead>\n\t\t\t    \t\t\t<tr>\n\t\t\t    \t\t\t\t<th>Player</th>\n\t\t\t    \t\t\t\t<th>Date Pulled</th>\n\t\t\t    \t\t\t\t<th>Strength</th>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t</thead>\n\t\t\t    \t\t<tbody>\n\t\t\t    \t\t\t<tr ng-repeat=\"(key,row) in playerData\">\n\t\t\t    \t\t\t\t<td>{{row[0]}}</td>\n\t\t\t    \t\t\t\t<td>{{row[2] | date:'medium'}}</td>\n\t\t\t    \t\t\t\t<td>{{row[3]}} lbs.</td>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t\t<tr ng-if=\"matrix.length == 0\">\n\t\t\t    \t\t\t\t<td colspan=\"3\">No Data Available Yet</td>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t</tbody>\n\t\t\t    \t</table>\n\t\t\t    </div>\n\t\t    \t<div class=\"col-lg-6\">\n\t\t\t    \t<h4>Processed data for upload</h4>\n\t\t\t    \tChoose pitcher: <select \n\t\t\t\t\t\tng-model=\"$root.currPlayerSelected[number]\"\n\t\t\t\t\t\tname=\"teamList{{number}}\"\n\t\t\t\t\t\tng-change=\"updatePlayerForData(number,this)\"\n\t\t\t\t\t\tng-options=\"option.name for option in currPlayersList track by option.id\"\n\t\t\t\t\t\tstyle=\"\" \n\t\t\t\t\t></select>\n\t\t\t\t\t<a class=\"btn btn-default btn-sm pull-right\" ng-click=\"mergeLines(number)\" role=\"button\">Merge</a>\n\t\t\t\t\t<a class=\"btn btn-default btn-sm pull-right\" ng-click=\"undoProcessing(number)\" role=\"button\" style=\"margin-right:5px;\">Undo</a>\n\t\t\t\t  \t<table class=\"table table-striped table-bordered\" style=\"margin-top:10px;\">\n\t\t\t    \t\t<thead>\n\t\t\t    \t\t\t<tr>\n\t\t\t    \t\t\t\t<th>Date Pulled</th>\n\t\t\t    \t\t\t\t<th>Strength</th>\n\t\t\t    \t\t\t\t<th>Pulls</th>\n\t\t\t    \t\t\t\t<th>Actions</th>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t</thead>\n\t\t\t    \t\t<tbody>\n\t\t\t    \t\t\t<tr ng-if=\"matrix.length > 0\" ng-repeat=\"(rowKey,row) in dataForCloud[number]\">\n\t\t\t    \t\t\t\t<td>{{row[2] | date:'medium'}}</td>\n\t\t\t    \t\t\t\t<td>{{row[3]}} lbs.</td>\n\t\t\t    \t\t\t\t<td>{{row[5]}}</td>\n\t\t\t    \t\t\t\t<td><button ng-click=\"deleteLine(number,row,rowKey)\"><i class=\"fa fa-trash-o\"></i></button></td>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t\t<tr ng-if=\"matrix.length == 0\">\n\t\t\t    \t\t\t\t<td colspan=\"3\">No Data Available Yet</td>\n\t\t\t    \t\t\t</tr>\n\t\t\t    \t\t</tbody>\n\t\t    \t\t</table>\n\t\t    \t\t<a class=\"btn btn-default btn-sm\" ng-click=\"uploadToCloud(number)\" role=\"button\">Upload</a>\n\t\t\t\t</div><!-- end .col-lg-6 -->\n\t\t\t</div><!-- end ng-repeat -->\n\t\t</div><!-- end .tab-content -->\n    </div><!-- end .col-lg-12 -->\n</div><!-- end .row -->";

exports.default = uploadExcelTemplate;

},{}],18:[function(require,module,exports){
'use strict';

var _controller = require('./custom/pages/upload-excel/controller');

var _controller2 = _interopRequireDefault(_controller);

var _template = require('./custom/pages/upload-excel/template');

var _template2 = _interopRequireDefault(_template);

var _controller3 = require('./custom/pages/global-chart/controller');

var _controller4 = _interopRequireDefault(_controller3);

var _template3 = require('./custom/pages/global-chart/template');

var _template4 = _interopRequireDefault(_template3);

var _config = require('./custom/customFields/changeUserRole/config');

var _config2 = _interopRequireDefault(_config);

var _view = require('./custom/customFields/changeUserRole/view');

var _view2 = _interopRequireDefault(_view);

var _directive = require('./custom/customFields/changeUserRole/directive');

var _directive2 = _interopRequireDefault(_directive);

var _config3 = require('./custom/customFields/stamplay_email_field/config');

var _config4 = _interopRequireDefault(_config3);

var _view3 = require('./custom/customFields/stamplay_email_field/view');

var _view4 = _interopRequireDefault(_view3);

var _directive3 = require('./custom/customFields/stamplay_email_field/directive');

var _directive4 = _interopRequireDefault(_directive3);

var _directive5 = require('./custom/customFields/UploadExcel/directive');

var _directive6 = _interopRequireDefault(_directive5);

var _directive7 = require('./custom/customFields/pitcher_chart/directive');

var _directive8 = _interopRequireDefault(_directive7);

var _directiveButton = require('./custom/pages/global-chart/directive-button');

var _directiveButton2 = _interopRequireDefault(_directiveButton);

var _Field = require('admin-config/lib/Field/Field');

var _Field2 = _interopRequireDefault(_Field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***************************************
 * INITIALIZE THE APPLICATION
 ***************************************/

var myApp = angular.module('myApp', ['ng-admin', 'angular-js-xlsx']);

// myApp.factory('sampleService', ['$rootScope','Restangular', 
// function($rootScope,Restangular) {

//     return {
//         test: function(){
//             Restangular.one('teams')
//             .get()
//             .then(function(result){
// console.log('result',result);
//                 var temp = result.plain();
//                 $rootScope.teamsList = temp;
//             })
//             .catch(function(error){
//                 return false;
//             });
//         }
//     }

// }]);

/***************************************
 * API AUTHENTICATION
 ***************************************/

require('./custom/apis/restdb/auth')(myApp);

/***************************************
 * INTERCEPTOR FUNCTIONS
 ***************************************/

require('./custom/apis/restdb/restdb_interceptors')(myApp);

/***************************************
 * ERROR HANDLERS
 ***************************************/

require('./custom/errorHandlers/appLevel')(myApp);

/***************************************
 * CUSTOM CONTROLLERS
 ***************************************/

// User Name controller (used to pass user name to header)
myApp.controller('username', ['$scope', '$window', function ($scope, $window) {
    // used in header.html

    $scope.username = $window.localStorage.getItem('username');
}]);

/***************************************
 * CUSTOM PAGES
 * ----
 * http://ng-admin-book.marmelab.com/doc/Custom-pages.html
 ***************************************/

myApp.config(function ($stateProvider) {
    $stateProvider.state('upload-excel', {
        parent: 'ng-admin',
        url: '/upload-excel/',
        params: { teamId: null },
        controller: _controller2.default,
        controllerAs: 'upload',
        template: _template2.default,
        resolve: {
            getTeams: ['$rootScope', function () {
                // console.log('$rootScope',$rootScope);
            }]
        }
    });
});

myApp.config(function ($stateProvider) {
    $stateProvider.state('global-chart', {
        parent: 'ng-admin',
        url: '/global-chart/',
        params: {},
        controller: _controller4.default,
        controllerAs: 'globalchart',
        template: _template4.default
    });
});

/***************************************
 * CUSTOMIZING NG-ADMIN DIRECTIVES
 * ----
 * https://github.com/marmelab/ng-admin/blob/master/doc/Theming.md#customizing-directives-templates
 * https://docs.angularjs.org/guide/decorators
 * http://stackoverflow.com/questions/32442605/angularjs-decorate-controllers
 ***************************************/

// EXAMPLE of editing text field directive without inheriting it to a custom field
// myApp.config(function(NgAdminConfigurationProvider, $provide) {
// // Override textarea template
// $provide.decorator('maTextFieldDirective', ['$delegate', function ($delegate) {
//     // You can modify directly the template
//     $delegate[0].template = angular.element($delegate[0].template).addClass('MyClass')[0].outerHTML;

//     // or use a templateURL (loaded from a file or a <script type="text/ng-template" id="string.html"></script> tag)
//     $delegate[0].template = '';
//     $delegate[0].templateUrl = 'string.html';

//     return $delegate;
// }]);

// // ...
// });

// The goal is to override the form submission for NGAdmin, in order to make it easier
// for custom fields to add values that can be submitted, and also to manage events
// added by custom fields. Check out these pages:
// http://stackoverflow.com/questions/32442605/angularjs-decorate-controllers
// Override:
// /node_modules/ng-admin/src/javascripts/ng-admin/Crud/form/FormController.js


/***************************************
 * DEFINE CUSTOM FIELDS & DIRECTIVES
 * ----
 * http://ng-admin-book.marmelab.com/doc/Custom-types.html
 * use of 'import': http://stackoverflow.com/questions/36451969/custom-type-the-field-class-is-injected-as-an-object-not-a-function
 ***************************************/

// change role field


// stamplay email field


// upload Excel directive


// pitcher chart (Chartist)


// global chart


// REGISTER THE CUSTOM FIELDS   
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    nga.registerFieldType('change_role_dropdown', _config2.default);
    nga.registerFieldType('stamplay_email_field', _config4.default);
}]);
myApp.config(['FieldViewConfigurationProvider', function (fvp) {
    fvp.registerFieldView('change_role_dropdown', _view2.default);
    fvp.registerFieldView('stamplay_email_field', _view4.default);
}]);

myApp.directive('changeUserRole', _directive2.default);
myApp.directive('stamplayEmailField', _directive4.default);
myApp.directive('uploadExcelButton', _directive6.default);
myApp.directive('pitcherChart', _directive8.default);
myApp.directive('globalChartButton', _directiveButton2.default);

/***************************************
 * DEFINE DATA ENTITIES
 ***************************************/

myApp.config(['NgAdminConfigurationProvider', 'RestangularProvider', function (nga, Restangular) {

    // ==================================================
    // create the default admin application
    // ==================================================

    var admin = nga.application('Andrisani Sports').baseApiUrl('https://andrisani-7eb3.restdb.io/rest/');

    // ==================================================
    // add entities that correspond to database
    // ==================================================

    // roles
    var createRole = require('./models/role');
    var roles = nga.entity('roles').identifier(nga.field('_id'));

    // users
    var createUser = require('./models/users');
    var userEntity = nga.entity('users');

    // teams
    var createTeams = require('./models/teams');
    var teams = nga.entity('teams');

    // team members
    var createTeamMembers = require('./models/team_members');
    var team_members = nga.entity('teammembers');

    // pitchers
    var createPitchers = require('./models/pitchers');
    var pitchers = nga.entity('pitchers');

    // pitcher workload
    var createPitcherWorkload = require('./models/pitcher_workload');
    var pitcher_workload = nga.entity('pitcher-workload');

    // pitching data
    var createPitchingData = require('./models/pitching_data');
    var pitching_data = nga.entity('pitching-data');

    // app issues
    var createIssue = require('./models/issues');
    var issues = nga.entity('issues');

    // pitcher injuries
    var createInjuries = require('./models/injuries');
    var injuries = nga.entity('injuries');

    // ADD TO ADMIN OBJECT
    admin.addEntity(createRole(nga, roles));
    admin.addEntity(createUser(nga, userEntity, roles, teams));
    admin.addEntity(createTeams(nga, teams, userEntity));
    admin.addEntity(createTeamMembers(nga, team_members, teams, userEntity));
    admin.addEntity(createPitchers(nga, pitchers, teams, userEntity));
    admin.addEntity(createPitcherWorkload(nga, pitcher_workload, pitchers, userEntity));
    admin.addEntity(createPitchingData(nga, pitching_data, pitchers, pitcher_workload, userEntity));
    admin.addEntity(createIssue(nga, issues, userEntity));
    admin.addEntity(createInjuries(nga, injuries, pitchers, userEntity));

    /***************************************
     * CUSTOM MENU
     ***************************************/

    admin.menu(nga.menu().addChild(nga.menu().title('Dashboard').icon('<span class="glyphicon glyphicon-calendar"></span>&nbsp;').link('/dashboard')).addChild(nga.menu(nga.entity('users')).title('Users').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Team Info</a>')).addChild(nga.menu(nga.entity('teams')).title('Teams').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu(nga.entity('teammembers')).title('Team Members').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Pitcher Info</a>')).addChild(nga.menu(nga.entity('pitchers')).title('Pitchers').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu(nga.entity('pitcher-workload')).title('Pitcher Workload').icon('<span class="glyphicon glyphicon-list-alt"></span>&nbsp;')).addChild(nga.menu(nga.entity('pitching-data')).title('Pitching Data').icon('<span class="glyphicon glyphicon-file"></span>&nbsp;')).addChild(nga.menu(nga.entity('injuries')).title('Pitcher Injuries').icon('<span class="glyphicon glyphicon-file"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; App Info</a>')).addChild(nga.menu(nga.entity('issues')).title('Issues').icon('<span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;')));

    /***************************************
     * CUSTOM HEADER
     ***************************************/
    var customHeaderTemplate = '\n    <div class="navbar-header">\n        <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">\n          <span class="icon-bar"></span>\n          <span class="icon-bar"></span>\n          <span class="icon-bar"></span>\n        </button>\n        <a class="navbar-brand" href="#" ng-click="appController.displayHome()" style="margin-right:10px;">Shoulder Saver</a>\n    </div>\n    <upload-excel-button entry="entry" style="display: inline-block;margin-top: 8px;"></upload-excel-button>\n    <global-chart-button entry="entry" style="display: inline-block;margin-top: 8px;"></global-chart-button>\n    <ul class="nav navbar-top-links navbar-right hidden-xs">\n        <li class="dropdown">\n            <a class="dropdown-toggle username" data-toggle="dropdown" ng-controller="username">\n                <i class="glyphicon glyphicon-user"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i>\n            </a>\n            <ul class="dropdown-menu dropdown-user" role="menu">\n                <li><a href="#" onclick="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></li>\n            </ul>\n        </li>\n    </ul>';

    admin.header(customHeaderTemplate);

    /***************************************
     * CUSTOM DASHBOARD
     * http://ng-admin-book.marmelab.com/doc/Dashboard.html
     ***************************************/
    admin.dashboard(nga.dashboard().addCollection(nga.collection(userEntity).perPage(10).fields([nga.field('displayName').label('Username'), nga.field('givenRole', 'reference').label('User Role').cssClasses('capitalize').targetEntity(roles).targetField(nga.field('name')), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))])).addCollection(nga.collection(teams).title('Teams').fields([nga.field('name')])).addCollection(nga.collection(team_members).title('Team Members').fields([nga.field('name'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))])).addCollection(nga.collection(pitchers).title('Pitchers').fields([nga.field('unique_id'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))])).addCollection(nga.collection(pitcher_workload).title('Pitcher Workload').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('dt_create', 'date').label('Created').format('short')])).addCollection(nga.collection(pitching_data).title('Pitching Data').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('dt_create', 'date').label('Created').format('short')])));

    /***************************************
     * CUSTOM ERROR MESSAGES
     ***************************************/

    var adminErrorHandlers = require('./custom/errorHandlers/admin');
    adminErrorHandlers(admin);

    /***************************************
     * ATTACH ADMIN APP TO DOM & RUN
     ***************************************/

    nga.configure(admin);
}]);

},{"./custom/apis/restdb/auth":1,"./custom/apis/restdb/restdb_interceptors":2,"./custom/customFields/UploadExcel/directive":3,"./custom/customFields/changeUserRole/config":4,"./custom/customFields/changeUserRole/directive":5,"./custom/customFields/changeUserRole/view":6,"./custom/customFields/pitcher_chart/directive":7,"./custom/customFields/stamplay_email_field/config":8,"./custom/customFields/stamplay_email_field/directive":9,"./custom/customFields/stamplay_email_field/view":10,"./custom/errorHandlers/admin":11,"./custom/errorHandlers/appLevel":12,"./custom/pages/global-chart/controller":13,"./custom/pages/global-chart/directive-button":14,"./custom/pages/global-chart/template":15,"./custom/pages/upload-excel/controller":16,"./custom/pages/upload-excel/template":17,"./models/injuries":19,"./models/issues":20,"./models/pitcher_workload":21,"./models/pitchers":22,"./models/pitching_data":23,"./models/role":24,"./models/team_members":25,"./models/teams":26,"./models/users":27,"admin-config/lib/Field/Field":28}],19:[function(require,module,exports){
'use strict';

module.exports = function (nga, injuries, pitchers, user) {

	// LIST VIEW
	injuries.listView().title('Pitcher Injuries').fields([nga.field('date_of_injury', 'date').label('Date').format('short'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('name'))]).listActions(['show', 'delete', 'edit']).filters([nga.field('email').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	injuries.showView().title('Pitcher Injury').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('date_of_injury').label('Date of Injury'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('name')), nga.field('note', 'wysiwyg').label('Note')]);

	// CREATION VIEW
	injuries.creationView().title('Pitcher Injury').fields([nga.field('date_of_injury', 'date').label('Date of Injury'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('name')).sortField('name').sortDir('ASC'), nga.field('note', 'wysiwyg').label('Note')]);

	// DELETION VIEW
	injuries.deletionView().title('Delete Injury');

	// EDITION VIEW
	injuries.editionView().title('Edit Injury').fields(nga.field('date_of_injury', 'date').label('Date of Injury'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('name')), nga.field('note', 'wysiwyg').label('Note'));

	return injuries;
};

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function (nga, issues, user) {

	// LIST VIEW
	issues.listView().title('All App Issues').fields([nga.field('message').label('Issue'), nga.field('dt_create', 'date').label('Created').format('short')]).listActions(['show', 'delete']).filters([nga.field('email').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	issues.showView().title('App Issue').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('name').label('User'), nga.field('email').label('User Email'), nga.field('message').label('Issue')]);

	// DELETION VIEW
	issues.deletionView().title('Delete Issue');

	return issues;
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitcher_workload, pitchers, user) {

	// LIST VIEW
	pitcher_workload.listView().title('All Pitcher Workload').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date').format('shortDate'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'edit', 'delete']).filters([nga.field('unique_id').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	pitcher_workload.showView().title('Pitcher\'s Workload').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date').format('shortDate'), nga.field('number_innings').label('Inning Count'), nga.field('number_pitches').label('Ptich Count'), nga.field('note', 'wysiwyg')]);

	// CREATION VIEW
	pitcher_workload.creationView().title('Add Pitcher\'s Workload').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date'), nga.field('number_innings').label('Inning Count'), nga.field('number_pitches').label('Pitch Count'), nga.field('note', 'wysiwyg')]);

	// EDITION VIEW
	pitcher_workload.editionView().title('Edit Pitcher\'s Workload').fields(pitcher_workload.creationView().fields());

	// DELETION VIEW
	pitcher_workload.deletionView().title('Delete Pitcher\'s Workload');

	return pitcher_workload;
};

},{}],22:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitchers, teams, user) {

	var listViewActionsTemplate = '<upload-excel-button entry="entry"></upload-excel-button>' + '<ma-export-to-csv-button entity="::entity" datastore="::datastore"></ma-export-to-csv-button>' + '<ma-create-button entity-name="pitchers" size="md" label="Create" default-values="{ post_id: entry.values.id }"></ma-create-button>';

	// LIST VIEW
	pitchers.listView().title('All Pitchers').fields([nga.field('unique_id').label('Pitcher'), nga.field('name'), nga.field('jersey_number'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'delete']).filters([nga.field('unique_id').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);
	//.actions(listViewActionsTemplate)

	// SHOW VIEW
	pitchers.showView().title('"{{ entry.values.unique_id }}"').fields([
	// nga.field('id'),
	nga.field('unique_id').label('Unique ID'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('name'), nga.field('jersey_number'), nga.field('age'), nga.field('height').label('Height (inches)'), nga.field('weight').label('Weight (lbs)'), nga.field('stride_length').label('Stride Length (inches)'), nga.field('device_height').label('Device Height (inches)'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('baselines', 'json'), nga.field('chart', 'template').template('<pitcher-chart></pitcher-chart>')]);

	// CREATION VIEW
	pitchers.creationView().title('Add Pitcher').fields([nga.field('name'), nga.field('jersey_number'), nga.field('age'), nga.field('birth_date', 'date'), nga.field('height').label('Height (inches)'), nga.field('weight').label('Weight (lbs)'), nga.field('stride_length').label('Stride Length (inches)'), nga.field('device_height').label('Device Height (inches)'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')).sortField('name').sortDir('ASC')]).onSubmitSuccess(['entry', 'entity', '$http', '$state', function (entry, entity, $http, $state) {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		function guid() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
		var uuid = guid();
		var pitcherID = entry._identifierValue;
		console.log('unique_id', uuid);
		console.log('pitcherID', pitcherID);
		$http.put('https://pitchingdata.stamplayapp.com/api/cobject/v1/pitchers/' + pitcherID, { unique_id: uuid }).then(function (response) {
			$state.go($state.get('show'), { entity: entity.name(), id: response.data._id });
		});

		return false;
	}]);

	// EDITION VIEW
	pitchers.editionView().title('Edit "{{ entry.values.unique_id }}"').fields([nga.field('name'), nga.field('jersey_number'), nga.field('age'), nga.field('height').label('Height (inches)'), nga.field('weight').label('Weight (lbs)'), nga.field('stride_length').label('Stride Length (inches)'), nga.field('device_height').label('Device Height (inches)')]);

	// DELETION VIEW
	pitchers.deletionView().title('Delete "{{ entry.values.unique_id }}"');

	return pitchers;
};

},{}],23:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitching_data, pitchers, pitcher_workload, user) {

	var listViewActionsTemplate = '<upload-excel-button entry="entry"></upload-excel-button>' + '<ma-export-to-csv-button entity="::entity" datastore="::datastore"></ma-export-to-csv-button>';

	// LIST VIEW
	pitching_data.listView().title('All Pitching Data').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'delete']).filters([nga.field('unique_id')]);
	//.actions(listViewActionsTemplate)

	// SHOW VIEW
	pitching_data.showView().title('Pitching Data').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('originalPullTimestamp', 'date').label('Original Creation').format('short'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('mainValue'), nga.field('note', 'wysiwyg')]);

	// DELETION VIEW
	pitching_data.deletionView().title('Delete Pitching Data');

	return pitching_data;
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function (nga, role) {

    // LIST VIEW
    role.listView().title('User Roles').fields([nga.field('_id'), nga.field('name').cssClasses('capitalize')]).listActions(['show', 'edit', 'delete']);

    // SHOW VIEW
    role.showView().title('"{{ entry.values.name }}" role').fields([nga.field('_id'), nga.field('name').cssClasses('capitalize col-sm-10 col-md-8 col-lg-7')]);

    return role;
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function (nga, team_members, teams, user) {

	// LIST VIEW
	team_members.listView().title('All Team Members').fields([nga.field('name'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).sortField('name').sortDir('ASC').listActions(['show', 'edit', 'delete']).filters([nga.field('name').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	team_members.showView().title('"{{ entry.values.name }}"').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('name'), nga.field('email', 'email'), nga.field('phone').label('Phone Number'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))]);

	// CREATION VIEW
	team_members.creationView().title('Add Team Member').fields([nga.field('name'), nga.field('email', 'email'), nga.field('phone'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')).sortField('name').sortDir('ASC')]);

	// EDITION VIEW
	team_members.editionView().title('Edit "{{ entry.values.name }}"').fields([nga.field('name'), nga.field('email', 'email'), nga.field('phone'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))]);

	// DELETION VIEW
	team_members.deletionView().title('Delete "{{ entry.values.name }}"');

	return team_members;
};

},{}],26:[function(require,module,exports){
'use strict';

module.exports = function (nga, teams, user) {

	var listViewActionsTemplate = '<upload-excel-button entry="entry"></upload-excel-button>' + '<ma-export-to-csv-button entity="::entity" datastore="::datastore"></ma-export-to-csv-button>' + '<ma-create-button entity-name="teams" size="md" label="Create" default-values="{ post_id: entry.values.id }"></ma-create-button>';

	// LIST VIEW
	teams.listView().title('All Teams').fields([nga.field('name').label('Team Name'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).sortField('name').sortDir('ASC').listActions(['show', 'edit', 'delete']).filters([nga.field('name').label('Team Name').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);
	//.actions(listViewActionsTemplate)

	// SHOW VIEW
	teams.showView().title('"{{ entry.values.name }}" Team').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('name'), nga.field('note', 'wysiwyg')]);

	// CREATION VIEW
	teams.creationView().title('Add Team').fields([nga.field('name'), nga.field('note', 'wysiwyg')]);

	// EDITION VIEW
	teams.editionView().title('Edit "{{ entry.values.name }}"').fields(teams.creationView().fields());

	// DELETION VIEW
	teams.deletionView().title('Delete "{{ entry.values.name }}"');

	return teams;
};

},{}],27:[function(require,module,exports){
'use strict';

module.exports = function (nga, users, roles, teams) {

    // LIST VIEW
    users.listView().fields([nga.field('displayName').label('Username'), nga.field('givenRole', 'reference').label('User Role').cssClasses('capitalize').targetEntity(roles).targetField(nga.field('name')), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))]).sortField('displayName').sortDir('ASC').listActions(['show', 'edit', 'delete']).filters([nga.field('_id'), nga.field('displayName').label('User Name').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'), nga.field('email').label('Email')]);

    // SHOW VIEW
    users.showView().title('"{{ entry.values.displayName }}" Profile').fields([nga.field('id'), nga.field('givenrole', 'change_role_dropdown').label('Role'), nga.field('displayName').label('Username'), nga.field('publicEmail').label('Email'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Last Update').format('short')]);

    // CREATION VIEW
    users.creationView().fields([nga.field('displayName').label('Username').validation({ required: true }), nga.field('email', 'stamplay_email_field').template('<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>', true).cssClasses('hidden-email'), nga.field('publicEmail').validation({ required: true }).label('Email'), nga.field('password').validation({ required: true }), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')).validation({ required: true })]).prepare(function (entry) {
        // entry.values.email = entry.values.publicEmail;
        entry.values.email = 'test@test.com';
    });

    // EDITION VIEW
    users.editionView().title('Edit "{{ entry.values.displayName }}"').fields([nga.field('displayName').label('Username'), nga.field('email', 'stamplay_email_field').template('<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>', true).cssClasses('hidden-email'), nga.field('publicEmail').label('Email'), nga.field('password'), nga.field('givenrole', 'change_role_dropdown').label('Role'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name'))]);

    // DELETION VIEW
    users.deletionView().title('Delete "{{ entry.values.displayName }}"');

    return users;
};

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _UtilsStringUtils = require("../Utils/stringUtils");

var _UtilsStringUtils2 = _interopRequireDefault(_UtilsStringUtils);

var Field = (function () {
    function Field(name) {
        _classCallCheck(this, Field);

        this._name = name || Math.random().toString(36).substring(7);
        this._detailLink = name === "id";
        this._type = "string";
        this._order = null;
        this._label = null;
        this._maps = [];
        this._transforms = [];
        this._attributes = {};
        this._cssClasses = null;
        this._validation = { required: false, minlength: 0, maxlength: 99999 };
        this._defaultValue = null;
        this._editable = true;
        this._sortable = true;
        this._detailLinkRoute = "edit";
        this._pinned = false;
        this._flattenable = true;
        this.dashboard = true;
        this.list = true;
        this._template = function () {
            return "";
        };
        this._templateIncludesLabel = false;
    }

    _createClass(Field, [{
        key: "label",
        value: function label() {
            if (arguments.length) {
                this._label = arguments[0];
                return this;
            }

            if (this._label === null) {
                return _UtilsStringUtils2["default"].camelCase(this._name);
            }

            return this._label;
        }
    }, {
        key: "type",
        value: function type() {
            return this._type;
        }
    }, {
        key: "name",
        value: function name() {
            if (arguments.length) {
                this._name = arguments[0];
                return this;
            }

            return this._name;
        }
    }, {
        key: "order",
        value: function order() {
            if (arguments.length) {
                if (arguments[1] !== true) {
                    console.warn("Setting order with Field.order is deprecated, order directly in fields array");
                }
                this._order = arguments[0];
                return this;
            }

            return this._order;
        }
    }, {
        key: "isDetailLink",
        value: function isDetailLink(detailLink) {
            if (arguments.length) {
                this._detailLink = arguments[0];
                return this;
            }

            if (this._detailLink === null) {
                return this._name === "id";
            }

            return this._detailLink;
        }
    }, {
        key: "map",

        /**
         * Add a function to be applied to the response object to turn it into an entry
         */
        value: function map(fn) {
            if (!fn) return this._maps;
            if (typeof fn !== "function") {
                var type = typeof fn;
                throw new Error("Map argument should be a function, " + type + " given.");
            }

            this._maps.push(fn);

            return this;
        }
    }, {
        key: "hasMaps",
        value: function hasMaps() {
            return !!this._maps.length;
        }
    }, {
        key: "getMappedValue",
        value: function getMappedValue(value, entry) {
            for (var i in this._maps) {
                value = this._maps[i](value, entry);
            }

            return value;
        }
    }, {
        key: "transform",

        /**
         * Add a function to be applied to the entry to turn it into a response object
         */
        value: function transform(fn) {
            if (!fn) return this._transforms;
            if (typeof fn !== "function") {
                var type = typeof fn;
                throw new Error("transform argument should be a function, " + type + " given.");
            }

            this._transforms.push(fn);

            return this;
        }
    }, {
        key: "hasTranforms",
        value: function hasTranforms() {
            return !!this._transforms.length;
        }
    }, {
        key: "getTransformedValue",
        value: function getTransformedValue(value, entry) {
            for (var i in this._transforms) {
                value = this._transforms[i](value, entry);
            }

            return value;
        }
    }, {
        key: "attributes",
        value: function attributes(_attributes) {
            if (!arguments.length) {
                return this._attributes;
            }

            this._attributes = _attributes;

            return this;
        }
    }, {
        key: "cssClasses",
        value: function cssClasses(classes) {
            if (!arguments.length) return this._cssClasses;
            this._cssClasses = classes;
            return this;
        }
    }, {
        key: "getCssClasses",
        value: function getCssClasses(entry) {
            if (!this._cssClasses) {
                return "";
            }

            if (this._cssClasses.constructor === Array) {
                return this._cssClasses.join(" ");
            }

            if (typeof this._cssClasses === "function") {
                return this._cssClasses(entry);
            }

            return this._cssClasses;
        }
    }, {
        key: "validation",
        value: function validation(_validation) {
            if (!arguments.length) {
                return this._validation;
            }

            for (var property in _validation) {
                if (!_validation.hasOwnProperty(property)) continue;
                if (_validation[property] === null) {
                    delete this._validation[property];
                } else {
                    this._validation[property] = _validation[property];
                }
            }

            return this;
        }
    }, {
        key: "defaultValue",
        value: function defaultValue(_defaultValue) {
            if (!arguments.length) return this._defaultValue;
            this._defaultValue = _defaultValue;
            return this;
        }
    }, {
        key: "editable",
        value: function editable(_editable) {
            if (!arguments.length) return this._editable;
            this._editable = _editable;
            return this;
        }
    }, {
        key: "sortable",
        value: function sortable(_sortable) {
            if (!arguments.length) return this._sortable;
            this._sortable = _sortable;
            return this;
        }
    }, {
        key: "detailLinkRoute",
        value: function detailLinkRoute(route) {
            if (!arguments.length) return this._detailLinkRoute;
            this._detailLinkRoute = route;
            return this;
        }
    }, {
        key: "pinned",
        value: function pinned(_pinned) {
            if (!arguments.length) return this._pinned;
            this._pinned = _pinned;
            return this;
        }
    }, {
        key: "flattenable",
        value: function flattenable() {
            return this._flattenable;
        }
    }, {
        key: "getTemplateValue",
        value: function getTemplateValue(data) {
            if (typeof this._template === "function") {
                return this._template(data);
            }

            return this._template;
        }
    }, {
        key: "getTemplateValueWithLabel",
        value: function getTemplateValueWithLabel(data) {
            return this._templateIncludesLabel ? this.getTemplateValue(data) : false;
        }
    }, {
        key: "templateIncludesLabel",
        value: function templateIncludesLabel(_templateIncludesLabel) {
            if (!arguments.length) return this._templateIncludesLabel;
            this._templateIncludesLabel = _templateIncludesLabel;
            return this;
        }
    }, {
        key: "template",
        value: function template(_template) {
            var templateIncludesLabel = arguments[1] === undefined ? false : arguments[1];

            if (!arguments.length) return this._template;
            this._template = _template;
            this._templateIncludesLabel = templateIncludesLabel;
            return this;
        }
    }, {
        key: "detailLink",
        set: function (isDetailLink) {
            return this._detailLink = isDetailLink;
        }
    }]);

    return Field;
})();

exports["default"] = Field;
module.exports = exports["default"];

},{"../Utils/stringUtils":31}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Field2 = require("./Field");

var _Field3 = _interopRequireDefault(_Field2);

var FileField = (function (_Field) {
    function FileField(name) {
        _classCallCheck(this, FileField);

        _get(Object.getPrototypeOf(FileField.prototype), "constructor", this).call(this, name);
        this._type = "file";
        this._uploadInformation = {
            url: "/upload",
            accept: "*"
        };
    }

    _inherits(FileField, _Field);

    _createClass(FileField, [{
        key: "uploadInformation",
        value: function uploadInformation(information) {
            if (!arguments.length) return this._uploadInformation;
            this._uploadInformation = information;
            return this;
        }
    }]);

    return FileField;
})(_Field3["default"]);

exports["default"] = FileField;
module.exports = exports["default"];

},{"./Field":28}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Field2 = require("./Field");

var _Field3 = _interopRequireDefault(_Field2);

var TextField = (function (_Field) {
    function TextField(name) {
        _classCallCheck(this, TextField);

        _get(Object.getPrototypeOf(TextField.prototype), "constructor", this).call(this, name);
        this._type = "text";
    }

    _inherits(TextField, _Field);

    return TextField;
})(_Field3["default"]);

exports["default"] = TextField;
module.exports = exports["default"];

},{"./Field":28}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    /**
     * @see http://stackoverflow.com/questions/10425287/convert-string-to-camelcase-with-regular-expression
     * @see http://phpjs.org/functions/ucfirst/
     */
    camelCase: function camelCase(text) {
        if (!text) {
            return text;
        }

        var f = text.charAt(0).toUpperCase();
        text = f + text.substr(1);

        return text.replace(/[-_.\s](.)/g, function (match, group1) {
            return ' ' + group1.toUpperCase();
        });
    }
};
module.exports = exports['default'];

},{}],32:[function(require,module,exports){
/**
 * humane.js
 * Humanized Messages for Notifications
 * @author Marc Harter (@wavded)
 * @example
 *   humane.log('hello world');
 * @license MIT
 * See more usage examples at: http://wavded.github.com/humane-js/
 */

;!function (name, context, definition) {
   if (typeof module !== 'undefined') module.exports = definition(name, context)
   else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition)
   else context[name] = definition(name, context)
}('humane', this, function (name, context) {
   var win = window
   var doc = document

   var ENV = {
      on: function (el, type, cb) {
         'addEventListener' in win ? el.addEventListener(type,cb,false) : el.attachEvent('on'+type,cb)
      },
      off: function (el, type, cb) {
         'removeEventListener' in win ? el.removeEventListener(type,cb,false) : el.detachEvent('on'+type,cb)
      },
      bind: function (fn, ctx) {
         return function () { fn.apply(ctx,arguments) }
      },
      isArray: Array.isArray || function (obj) { return Object.prototype.toString.call(obj) === '[object Array]' },
      config: function (preferred, fallback) {
         return preferred != null ? preferred : fallback
      },
      transSupport: false,
      useFilter: /msie [678]/i.test(navigator.userAgent), // sniff, sniff
      _checkTransition: function () {
         var el = doc.createElement('div')
         var vendors = { webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' }

         for (var vendor in vendors)
            if (vendor + 'Transition' in el.style) {
               this.vendorPrefix = vendors[vendor]
               this.transSupport = true
            }
      }
   }
   ENV._checkTransition()

   var Humane = function (o) {
      o || (o = {})
      this.queue = []
      this.baseCls = o.baseCls || 'humane'
      this.addnCls = o.addnCls || ''
      this.timeout = 'timeout' in o ? o.timeout : 2500
      this.waitForMove = o.waitForMove || false
      this.clickToClose = o.clickToClose || false
      this.timeoutAfterMove = o.timeoutAfterMove || false
      this.container = o.container

      try { this._setupEl() } // attempt to setup elements
      catch (e) {
        ENV.on(win,'load',ENV.bind(this._setupEl, this)) // dom wasn't ready, wait till ready
      }
   }

   Humane.prototype = {
      constructor: Humane,
      _setupEl: function () {
         var el = doc.createElement('div')
         el.style.display = 'none'
         if (!this.container){
           if(doc.body) this.container = doc.body;
           else throw 'document.body is null'
         }
         this.container.appendChild(el)
         this.el = el
         this.removeEvent = ENV.bind(function(){
            var timeoutAfterMove = ENV.config(this.currentMsg.timeoutAfterMove,this.timeoutAfterMove)
            if (!timeoutAfterMove){
               this.remove()
            } else {
               setTimeout(ENV.bind(this.remove,this),timeoutAfterMove)
            }
         },this)

         this.transEvent = ENV.bind(this._afterAnimation,this)
         this._run()
      },
      _afterTimeout: function () {
         if (!ENV.config(this.currentMsg.waitForMove,this.waitForMove)) this.remove()

         else if (!this.removeEventsSet) {
            ENV.on(doc.body,'mousemove',this.removeEvent)
            ENV.on(doc.body,'click',this.removeEvent)
            ENV.on(doc.body,'keypress',this.removeEvent)
            ENV.on(doc.body,'touchstart',this.removeEvent)
            this.removeEventsSet = true
         }
      },
      _run: function () {
         if (this._animating || !this.queue.length || !this.el) return

         this._animating = true
         if (this.currentTimer) {
            clearTimeout(this.currentTimer)
            this.currentTimer = null
         }

         var msg = this.queue.shift()
         var clickToClose = ENV.config(msg.clickToClose,this.clickToClose)

         if (clickToClose) {
            ENV.on(this.el,'click',this.removeEvent)
            ENV.on(this.el,'touchstart',this.removeEvent)
         }

         var timeout = ENV.config(msg.timeout,this.timeout)

         if (timeout > 0)
            this.currentTimer = setTimeout(ENV.bind(this._afterTimeout,this), timeout)

         if (ENV.isArray(msg.html)) msg.html = '<ul><li>'+msg.html.join('<li>')+'</ul>'

         this.el.innerHTML = msg.html
         this.currentMsg = msg
         this.el.className = this.baseCls
         if (ENV.transSupport) {
            this.el.style.display = 'block'
            setTimeout(ENV.bind(this._showMsg,this),50)
         } else {
            this._showMsg()
         }

      },
      _setOpacity: function (opacity) {
         if (ENV.useFilter){
            try{
               this.el.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity*100
            } catch(err){}
         } else {
            this.el.style.opacity = String(opacity)
         }
      },
      _showMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-animate'
         }
         else {
            var opacity = 0
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-js-animate'
            this._setOpacity(0) // reset value so hover states work
            this.el.style.display = 'block'

            var self = this
            var interval = setInterval(function(){
               if (opacity < 1) {
                  opacity += 0.1
                  if (opacity > 1) opacity = 1
                  self._setOpacity(opacity)
               }
               else clearInterval(interval)
            }, 30)
         }
      },
      _hideMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls
            ENV.on(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)
         }
         else {
            var opacity = 1
            var self = this
            var interval = setInterval(function(){
               if(opacity > 0) {
                  opacity -= 0.1
                  if (opacity < 0) opacity = 0
                  self._setOpacity(opacity);
               }
               else {
                  self.el.className = self.baseCls+' '+addnCls
                  clearInterval(interval)
                  self._afterAnimation()
               }
            }, 30)
         }
      },
      _afterAnimation: function () {
         if (ENV.transSupport) ENV.off(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)

         if (this.currentMsg.cb) this.currentMsg.cb()
         this.el.style.display = 'none'

         this._animating = false
         this._run()
      },
      remove: function (e) {
         var cb = typeof e == 'function' ? e : null

         ENV.off(doc.body,'mousemove',this.removeEvent)
         ENV.off(doc.body,'click',this.removeEvent)
         ENV.off(doc.body,'keypress',this.removeEvent)
         ENV.off(doc.body,'touchstart',this.removeEvent)
         ENV.off(this.el,'click',this.removeEvent)
         ENV.off(this.el,'touchstart',this.removeEvent)
         this.removeEventsSet = false

         if (cb && this.currentMsg) this.currentMsg.cb = cb
         if (this._animating) this._hideMsg()
         else if (cb) cb()
      },
      log: function (html, o, cb, defaults) {
         var msg = {}
         if (defaults)
           for (var opt in defaults)
               msg[opt] = defaults[opt]

         if (typeof o == 'function') cb = o
         else if (o)
            for (var opt in o) msg[opt] = o[opt]

         msg.html = html
         if (cb) msg.cb = cb
         this.queue.push(msg)
         this._run()
         return this
      },
      spawn: function (defaults) {
         var self = this
         return function (html, o, cb) {
            self.log.call(self,html,o,cb,defaults)
            return self
         }
      },
      create: function (o) { return new Humane(o) }
   }
   return new Humane()
});

},{}]},{},[18]);
