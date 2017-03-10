/***************************************
 * INITIALIZE THE APPLICATION
 ***************************************/

var myApp = angular.module('myApp', 
    [
        'ng-admin'
    ]
);

/***************************************
 * API AUTHENTICATION
 ***************************************/

// require('./globalAdmin/apis/stamplay/auth')(myApp);

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
myApp.controller('username', ['$scope', '$window', function($scope, $window) { // used in header.html
	
	$scope.username =  $window.localStorage.getItem('username');
    
}])

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

// Matrix Editor - displaying the array of strings field from Stamplay
// import MatrixEditorFieldConfig from './globalAdmin/customFields/matrix_editor/matrix_editor_field_config';
// import MatrixEditorFieldView from './globalAdmin/customFields/matrix_editor/matrix_editor_field_view';
// import MatrixEditorDirective from './globalAdmin/customFields/matrix_editor/matrix_editor_directive';

// REGISTER THE CUSTOM FIELDS   
myApp.config(['NgAdminConfigurationProvider', function(nga) {
    // nga.registerFieldType('matrix_editor', MatrixEditorFieldConfig);
}]);
myApp.config(['FieldViewConfigurationProvider', function(fvp) {
    // fvp.registerFieldView('matrix_editor', MatrixEditorFieldView);
}]);
// myApp.directive('matrixEditor', MatrixEditorDirective);
  

/***************************************
 * DEFINE DATA ENTITIES
 ***************************************/

import Field from 'admin-config/lib/Field/Field';
myApp.config(['NgAdminConfigurationProvider','RestangularProvider', 
    function(nga,Restangular) {

    // ==================================================
    // create the default admin application
    // ==================================================
    
    var admin = nga
        .application('Byron Katie Admin')
        .baseApiUrl('https://online-school-for-the-work.stamplayapp.com/api/cobject/v1/');

    // ==================================================
    // add entities
    // ==================================================

    // roles (https://online-school-for-the-work.stamplayapp.com/api/user/v1/roles)
    var createRole = require('./models/role');
    var roles = nga.entity('roles').baseApiUrl('https://online-school-for-the-work.stamplayapp.com/api/user/v1/').identifier(nga.field('_id'));
    
    // users (https://online-school-for-the-work.stamplayapp.com/api/user/v1/)
    var createUser = require('./models/users');
    var userEntity = nga.entity('users').baseApiUrl('https://online-school-for-the-work.stamplayapp.com/api/user/v1/');
    
    

    // ADD TO ADMIN OBJECT
    admin.addEntity(createRole(nga,roles));
    admin.addEntity(createUser(nga,userEntity,roles));
    
/***************************************
 * CUSTOM MENU
 ***************************************/

    admin.menu(nga.menu()
        .addChild(nga.menu().title('Dashboard').icon('<span class="glyphicon glyphicon-calendar"></span>&nbsp;').link('/dashboard'))
        .addChild(nga.menu(nga.entity('users')).title('Users').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;'))
        .addChild(nga.menu().title('BK Content').icon('<span class="glyphicon glyphicon-book"></span>&nbsp;'))
    );

/***************************************
 * CUSTOM HEADER
 ***************************************/
 
    // var customHeaderTemplate = '';
    // admin.header(customHeaderTemplate);

/***************************************
 * CUSTOM DASHBOARD
 * http://ng-admin-book.marmelab.com/doc/Dashboard.html
 ***************************************/



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