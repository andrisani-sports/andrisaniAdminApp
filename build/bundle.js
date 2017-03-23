(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"admin-config/lib/Field/FileField":20}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"admin-config/lib/Field/TextField":21}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"humane-js":23}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
				// STAMPLAY CANONICAL URL IS:
				// https://bkschool.stamplayapp.com/api/cobject/v1/audio
				// ? n=10 & sort=audio_url & page=1 & per_page=10

				if (!params.page) {
					params.page = params._page;
				}
				if (!params.per_page) {
					params.per_page = params._perPage;
				}
				if (params._sortField) {
					params.sort = '';
					if (params._sortDir == 'DESC') params.sort = '-';
					params.sort += params._sortField;
				}
				delete params._page;
				delete params._perPage;
				delete params._sortField;
				delete params._sortDir;
			}

			//console.log('params post Stamplay processing:',params);

			return { element: element, params: params };
		});

		/***************************************
   * request POST-RESTANGULAR INTERCEPTOR FUNCTIONS
   ***************************************/

		// USING 'unshift' TO RUN THESE FUNCTIONS FIRST (after the Restangular interceptor)!!!!
		$httpProvider.interceptors.unshift(addContentTypeToHeader);

		// these functions run in regular order (after Restangular interceptors)
		$httpProvider.interceptors.push(fixStamplayIssues);

		/*
   * FIX ISSUES FOR STAMPLAY API
   */

		// Angular removes the header 'Content-Type' if request is GET.
		// This function is a hack to add the header back in, because Stamplay 
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

		function fixStamplayIssues($q) {
			return {
				request: function request(config) {

					config = angular.copy(config);

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

					// When NG-Admin does a list GET, it receives all fields for 
					// that data model, and those fields persist in the dataStore, 
					// even if the editionView only defines a couple of fields. 
					// Which means that the un-editable fields in Stamplay must be 
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

						// zones_arr is an array of strings in Stamplay, needs
						// processing
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
							delete config.data.__v;
							delete config.data._id;
							delete config.data.appId;
							delete config.data.cobjectId;
							delete config.data.dt_create;
							delete config.data.dt_update;
							delete config.data.id;
							delete config.data.actions;
						}
					}

					// translate NGAdmin filter(s) to Stamplay format
					if (config.method == 'GET' && config.params) {
						var where = {};

						// hack to fix an NGA problem: when using 'referenced_list', 
						// [object Object] appears in url
						if (config.params._filters && '[object Object]' in config.params._filters) {
							var temp = config.params._filters['[object Object]'];
							delete config.params._filters['[object Object]'];
							where.chatRoomId = temp; // Stamplay uses a straight key:value pair in GET
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
					// // the code below makes a reference field (page in situations) to have [Object object] instead of the record id
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

			//console.log('in addResponseInterceptor');

			var newResponse;
			//console.log('Response',response);
			//console.log(typeof response.data.data);
			//console.log('Data',data);

			// ADJUST STAMPLAY'S STRUCTURE TO MATCH WHAT NG-ADMIN EXPECTS
			if ('data' in response.data) {
				var newData = response.data.data;
				if (newData.length > 0) {
					newResponse = response.data.data;
				} else {
					newResponse = [];
				}
			} else {
				newResponse = response.data;
			}

			// FIX PAGINATION
			if (operation == "getList") {
				var contentRange = data.pagination.total_elements;
				//console.log('num of entries retrieved by Restangular',contentRange);
				response.totalCount = contentRange;
			}

			//console.log('newResponse',newResponse);

			return newResponse;
		});
	});
};

},{}],10:[function(require,module,exports){
'use strict';

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

var _Field = require('admin-config/lib/Field/Field');

var _Field2 = _interopRequireDefault(_Field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***************************************
 * INITIALIZE THE APPLICATION
 ***************************************/

var myApp = angular.module('myApp', ['ng-admin']);

/***************************************
 * API AUTHENTICATION
 ***************************************/

// require('./custom/apis/stamplay/auth')(myApp);

/***************************************
 * INTERCEPTOR FUNCTIONS
 ***************************************/

require('./custom/interceptors/stamplay')(myApp);

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

/***************************************
 * DEFINE DATA ENTITIES
 ***************************************/

myApp.config(['NgAdminConfigurationProvider', 'RestangularProvider', function (nga, Restangular) {

    // ==================================================
    // create the default admin application
    // ==================================================

    var admin = nga.application('Andrisani Sports').baseApiUrl('https://pitchingdata.stamplayapp.com/api/cobject/v1/');

    // ==================================================
    // add entities
    // ==================================================

    // roles (https://pitchingdata.stamplayapp.com/api/user/v1/roles)
    var createRole = require('./models/role');
    var roles = nga.entity('roles').baseApiUrl('https://pitchingdata.stamplayapp.com/api/user/v1/').identifier(nga.field('_id'));

    // users (https://online-school-for-the-work.stamplayapp.com/api/user/v1/)
    var createUser = require('./models/users');
    var userEntity = nga.entity('users').baseApiUrl('https://pitchingdata.stamplayapp.com/api/user/v1/');

    // teams
    var createTeams = require('./models/teams');
    var teams = nga.entity('teams');

    // team members
    var createTeamMembers = require('./models/team_members');
    var team_members = nga.entity('team_members');

    // pitchers
    var createPitchers = require('./models/pitchers');
    var pitchers = nga.entity('pitchers');

    // pitcher workload
    var createPitcherWorkload = require('./models/pitcher_workload');
    var pitcher_workload = nga.entity('pitcher_workload');

    // pitching data
    var createPitchingData = require('./models/pitching_data');
    var pitching_data = nga.entity('pitching_data');

    // app issues
    var createIssue = require('./models/issues');
    var issues = nga.entity('issues');

    // ADD TO ADMIN OBJECT
    admin.addEntity(createRole(nga, roles));
    admin.addEntity(createUser(nga, userEntity, roles, teams));
    admin.addEntity(createTeams(nga, teams, userEntity));
    admin.addEntity(createTeamMembers(nga, team_members, teams, userEntity));
    admin.addEntity(createPitchers(nga, pitchers, teams, userEntity));
    admin.addEntity(createPitcherWorkload(nga, pitcher_workload, pitchers, userEntity));
    admin.addEntity(createPitchingData(nga, pitching_data, pitchers, pitcher_workload, userEntity));
    admin.addEntity(createIssue(nga, issues, userEntity));

    /***************************************
     * CUSTOM MENU
     ***************************************/

    admin.menu(nga.menu().addChild(nga.menu().title('Dashboard').icon('<span class="glyphicon glyphicon-calendar"></span>&nbsp;').link('/dashboard')).addChild(nga.menu(nga.entity('users')).title('Users').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Team Info</a>')).addChild(nga.menu(nga.entity('teams')).title('Teams').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu(nga.entity('team_members')).title('Team Members').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Pitcher Info</a>')).addChild(nga.menu(nga.entity('pitchers')).title('Pitchers').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;')).addChild(nga.menu(nga.entity('pitcher_workload')).title('Pitcher Workload').icon('<span class="glyphicon glyphicon-list-alt"></span>&nbsp;')).addChild(nga.menu(nga.entity('pitching_data')).title('Pitching Data').icon('<span class="glyphicon glyphicon-file"></span>&nbsp;')).addChild(nga.menu().template('<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; App Info</a>')).addChild(nga.menu(nga.entity('issues')).title('Issues').icon('<span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;')));

    /***************************************
     * CUSTOM HEADER
     ***************************************/
    var customHeaderTemplate = '<div class="navbar-header">' + '<button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">' + '<span class="icon-bar"></span>' + '<span class="icon-bar"></span>' + '<span class="icon-bar"></span>' + '</button>' + '<a class="navbar-brand" href="#" ng-click="appController.displayHome()">Shoulder Saver</a>' + '</div>' + '<ul class="nav navbar-top-links navbar-right hidden-xs">' + '<li class="dropdown">' + '<a class="dropdown-toggle username" data-toggle="dropdown" ng-controller="username">' + '<i class="glyphicon glyphicon-user"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i>' + '</a>' + '<ul class="dropdown-menu dropdown-user" role="menu">' + '<li><a href="#" onclick="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></li>' + '</ul>' + '</li>' + '</ul>';

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

},{"./custom/customFields/changeUserRole/config":1,"./custom/customFields/changeUserRole/directive":2,"./custom/customFields/changeUserRole/view":3,"./custom/customFields/stamplay_email_field/config":4,"./custom/customFields/stamplay_email_field/directive":5,"./custom/customFields/stamplay_email_field/view":6,"./custom/errorHandlers/admin":7,"./custom/errorHandlers/appLevel":8,"./custom/interceptors/stamplay":9,"./models/issues":11,"./models/pitcher_workload":12,"./models/pitchers":13,"./models/pitching_data":14,"./models/role":15,"./models/team_members":16,"./models/teams":17,"./models/users":18,"admin-config/lib/Field/Field":19}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitcher_workload, pitchers, user) {

	// LIST VIEW
	pitcher_workload.listView().title('All Pitcher Workload').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date').format('shortDate'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'edit', 'delete']).filters([nga.field('unique_id').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	pitcher_workload.showView().title('Pitcher\'s Workload').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date').format('shortDate'), nga.field('number_innings').label('Inning Count'), nga.field('number_pitches').label('Ptich Count'), nga.field('note', 'wysiwyg')]);

	// CREATION VIEW
	pitcher_workload.creationView().title('Add Pitcher\'s Workload').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('game_date', 'date').label('Game Date'), nga.field('number_innings').label('Inning Count'), nga.field('number_pitches').label('Ptich Count'), nga.field('note', 'wysiwyg')]);

	// EDITION VIEW
	pitcher_workload.editionView().title('Edit Pitcher\'s Workload').fields(pitcher_workload.creationView().fields());

	// DELETION VIEW
	pitcher_workload.deletionView().title('Delete Pitcher\'s Workload');

	return pitcher_workload;
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitchers, teams, user) {

	// LIST VIEW
	pitchers.listView().title('All Pitchers').fields([nga.field('unique_id').label('Pitcher'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'delete']).filters([nga.field('name').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	pitchers.showView().title('"{{ entry.values.unique_id }}"').fields([
	// nga.field('id'),
	nga.field('unique_id').label('Unique ID'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'),
	// nga.field('name'),
	nga.field('age'), nga.field('height').label('Height (inches)'), nga.field('weight').label('Weight (lbs)'), nga.field('stride_length').label('Stride Length (inches)'), nga.field('device_height').label('Device Height (inches)'), nga.field('team', 'reference').label('Team').targetEntity(teams).targetField(nga.field('name')), nga.field('baselines', 'json')]);

	// CREATION VIEW
	//  pitchers.creationView()
	//  	.title('Add Pitcher')
	//  	.fields([
	//  		nga.field('name'),
	//  		nga.field('age'),
	// 	nga.field('height').label('Height (inches)'),
	// 	nga.field('weight').label('Weight (lbs)'),
	// 	nga.field('stride_length').label('Stride Length (inches)'),
	// 	nga.field('device_height').label('Device Height (inches)'),
	// 	nga.field('team', 'reference')
	// 		.label('Team')
	//        .targetEntity(teams)
	//        .targetField(nga.field('name'))
	//        .sortField('name')
	//        .sortDir('ASC')
	// ])
	// .onSubmitSuccess(['entry','entity','$http','$state', function(entry,entity,$http,$state){
	// 	function s4() {
	// 			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	// 		}
	// 	function guid() {
	// 			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	// 	}
	// 	var uuid = guid();
	// 	var pitcherID = entry._identifierValue;
	// 		console.log('unique_id', uuid);
	// 		console.log('pitcherID', pitcherID);
	// 		$http.put('https://pitchingdata.stamplayapp.com/api/cobject/v1/pitchers/' + pitcherID, { unique_id:uuid })
	// 			.then(function(response){
	// 				$state.go($state.get('show'), { entity: entity.name(), id: response.data._id });
	// 			});

	// 		return false;
	// }])


	// EDITION VIEW
	//  pitchers.editionView()
	//  .title('Edit "{{ entry.values.unique_id }}"')
	//  .fields([
	//  		nga.field('name'),
	//  		nga.field('age'),
	// 	nga.field('height').label('Height (inches)'),
	// 	nga.field('weight').label('Weight (lbs)'),
	// 	nga.field('stride_length').label('Stride Length (inches)'),
	// 	nga.field('device_height').label('Device Height (inches)')
	// ])

	// DELETION VIEW
	pitchers.deletionView().title('Delete "{{ entry.values.unique_id }}"');

	return pitchers;
};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function (nga, pitching_data, pitchers, pitcher_workload, user) {

	// LIST VIEW
	pitching_data.listView().title('All Pitching Data').fields([nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).listActions(['show', 'delete']).filters([nga.field('unique_id').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

	// SHOW VIEW
	pitching_data.showView().title('Pitching Data').fields([nga.field('id'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short'), nga.field('pitcher', 'reference').label('Pitcher').targetEntity(pitchers).targetField(nga.field('unique_id')), nga.field('pulls'), nga.field('note', 'wysiwyg')]);

	// DELETION VIEW
	pitching_data.deletionView().title('Delete Pitching Data');

	return pitching_data;
};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function (nga, role) {

    // LIST VIEW
    role.listView().title('User Roles').fields([nga.field('_id'), nga.field('name').cssClasses('capitalize')]).listActions(['show', 'edit', 'delete']);

    // SHOW VIEW
    role.showView().title('"{{ entry.values.name }}" role').fields([nga.field('_id'), nga.field('name').cssClasses('capitalize col-sm-10 col-md-8 col-lg-7')]);

    return role;
};

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function (nga, teams, user) {

	// LIST VIEW
	teams.listView().title('All Teams').fields([nga.field('name').label('Team Name'), nga.field('dt_create', 'date').label('Created').format('short'), nga.field('dt_update', 'date').label('Updated').format('short')]).sortField('name').sortDir('ASC').listActions(['show', 'edit', 'delete']).filters([nga.field('name').label('Team Name').pinned(true).template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')]);

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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"../Utils/stringUtils":22}],20:[function(require,module,exports){
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

},{"./Field":19}],21:[function(require,module,exports){
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

},{"./Field":19}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}]},{},[10]);
