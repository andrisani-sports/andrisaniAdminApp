/***************************************
 * INITIALIZE THE APPLICATION
 ***************************************/

 var myApp = angular.module('myApp', 
    [ 'ng-admin', 'angular-js-xlsx' ]
);

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
myApp.controller('username', ['$scope', '$window', function($scope, $window) { // used in header.html
	
	$scope.username =  $window.localStorage.getItem('username');
    
}])

/***************************************
 * CUSTOM PAGES
 * ----
 * http://ng-admin-book.marmelab.com/doc/Custom-pages.html
 ***************************************/

import uploadExcelController from './custom/pages/upload-excel/controller';
import uploadExcelTemplate from './custom/pages/upload-excel/template';
myApp.config(function ($stateProvider) {
    $stateProvider.state('upload-excel', {
        parent: 'ng-admin',
        url: '/upload-excel/',
        params: { teamId: null },
        controller: uploadExcelController,
        controllerAs: 'upload',
        template: uploadExcelTemplate,
        resolve: {
            getTeams: ['$rootScope',function(){
// console.log('$rootScope',$rootScope);
            }]
        }
    });
});

import globalChartController from './custom/pages/global-chart/controller';
import globalChartTemplate from './custom/pages/global-chart/template';
myApp.config(function ($stateProvider) {
    $stateProvider.state('global-chart', {
        parent: 'ng-admin',
        url: '/global-chart/',
        params: { },
        controller: globalChartController,
        controllerAs: 'globalchart',
        template: globalChartTemplate
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
import changeRoleFieldConfig from './custom/customFields/changeUserRole/config';
import changeRoleFieldView from './custom/customFields/changeUserRole/view';
import changeRoleFieldDirective from './custom/customFields/changeUserRole/directive';

// stamplay email field
import StamplayEmailFieldConfig from './custom/customFields/stamplay_email_field/config';
import StamplayEmailFieldView from './custom/customFields/stamplay_email_field/view';
import stamplayEmailFieldDirective from './custom/customFields/stamplay_email_field/directive';

// upload Excel directive
import UploadExcelButtonDirective from './custom/customFields/UploadExcel/directive';

// pitcher chart (Chartist)
import pitcherChartDirective from './custom/customFields/pitcher_chart/directive';

// global chart
import globalChartButtonDirective from './custom/pages/global-chart/directive-button';

// REGISTER THE CUSTOM FIELDS   
myApp.config(['NgAdminConfigurationProvider', function(nga) {
    nga.registerFieldType('change_role_dropdown',changeRoleFieldConfig);
    nga.registerFieldType('stamplay_email_field',StamplayEmailFieldConfig);
}]);
myApp.config(['FieldViewConfigurationProvider', function(fvp) {
    fvp.registerFieldView('change_role_dropdown',changeRoleFieldView);
    fvp.registerFieldView('stamplay_email_field',StamplayEmailFieldView);
}]);

myApp.directive('changeUserRole',changeRoleFieldDirective);
myApp.directive('stamplayEmailField',stamplayEmailFieldDirective);
myApp.directive('uploadExcelButton',UploadExcelButtonDirective);
myApp.directive('pitcherChart',pitcherChartDirective);
myApp.directive('globalChartButton',globalChartButtonDirective);
  

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
        .application('Andrisani Sports')
        .baseApiUrl('https://andrisani-7eb3.restdb.io/rest/');
 
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
    admin.addEntity(createRole(nga,roles));
    admin.addEntity(createUser(nga,userEntity,roles,teams));
    admin.addEntity(createTeams(nga,teams,userEntity));
    admin.addEntity(createTeamMembers(nga,team_members,teams,userEntity));
    admin.addEntity(createPitchers(nga,pitchers,teams,userEntity));
    admin.addEntity(createPitcherWorkload(nga,pitcher_workload,pitchers,userEntity));
    admin.addEntity(createPitchingData(nga,pitching_data,pitchers,pitcher_workload,userEntity));
    admin.addEntity(createIssue(nga,issues,userEntity));
    admin.addEntity(createInjuries(nga,injuries,pitchers,userEntity));
    
/***************************************
 * CUSTOM MENU
 ***************************************/

    admin.menu(nga.menu()
        .addChild(nga.menu().title('Dashboard').icon('<span class="glyphicon glyphicon-calendar"></span>&nbsp;').link('/dashboard'))
        .addChild(nga.menu(nga.entity('users')).title('Users').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;'))
        .addChild(nga.menu().template(`<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Team Info</a>`))
            .addChild(nga.menu(nga.entity('teams')).title('Teams').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;'))
            .addChild(nga.menu(nga.entity('teammembers')).title('Team Members').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;'))
        .addChild(nga.menu().template(`<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; Pitcher Info</a>`))
            .addChild(nga.menu(nga.entity('pitchers')).title('Pitchers').icon('<span class="glyphicon glyphicon-user"></span>&nbsp;'))
            .addChild(nga.menu(nga.entity('pitcher-workload')).title('Pitcher Workload').icon('<span class="glyphicon glyphicon-list-alt"></span>&nbsp;'))
            .addChild(nga.menu(nga.entity('pitching-data')).title('Pitching Data').icon('<span class="glyphicon glyphicon-file"></span>&nbsp;'))
            .addChild(nga.menu(nga.entity('injuries')).title('Pitcher Injuries').icon('<span class="glyphicon glyphicon-file"></span>&nbsp;'))
        .addChild(nga.menu().template(`<a class="menu-heading"><span class="glyphicon glyphicon-folder-open"></span>&nbsp; App Info</a>`))
            .addChild(nga.menu(nga.entity('issues')).title('Issues').icon('<span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;'))
    );

/***************************************
 * CUSTOM HEADER
 ***************************************/
    var customHeaderTemplate = `
    <div class="navbar-header">
        <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#" ng-click="appController.displayHome()" style="margin-right:10px;">Shoulder Saver</a>
    </div>
    <upload-excel-button entry="entry" style="display: inline-block;margin-top: 8px;"></upload-excel-button>
    <global-chart-button entry="entry" style="display: inline-block;margin-top: 8px;"></global-chart-button>
    <ul class="nav navbar-top-links navbar-right hidden-xs">
        <li class="dropdown">
            <a class="dropdown-toggle username" data-toggle="dropdown" ng-controller="username">
                <i class="glyphicon glyphicon-user"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i>
            </a>
            <ul class="dropdown-menu dropdown-user" role="menu">
                <li><a href="#" onclick="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></li>
            </ul>
        </li>
    </ul>`;

    admin.header(customHeaderTemplate);

/***************************************
 * CUSTOM DASHBOARD
 * http://ng-admin-book.marmelab.com/doc/Dashboard.html
 ***************************************/
admin.dashboard(nga.dashboard()
    .addCollection(nga.collection(userEntity)
        .perPage(10)
        .fields([
            nga.field('displayName').label('Username'),
            nga.field('givenRole', 'reference')
                .label('User Role')
                .cssClasses('capitalize')
                .targetEntity(roles)
                .targetField(nga.field('name')),
            nga.field('team', 'reference')
                .label('Team')
                .targetEntity(teams)
                .targetField(nga.field('name'))
        ])
        
    )
    .addCollection(nga.collection(teams)
        .title('Teams')
        .fields([
            nga.field('name')
        ])
    )
    .addCollection(nga.collection(team_members)
        .title('Team Members')
        .fields([
            nga.field('name'),
            nga.field('team', 'reference')
                .label('Team')
                .targetEntity(teams)
                .targetField(nga.field('name'))
        ])
    )
    .addCollection(nga.collection(pitchers)
        .title('Pitchers')
        .fields([
            nga.field('unique_id'),
            nga.field('team', 'reference')
                .label('Team')
                .targetEntity(teams)
                .targetField(nga.field('name'))
        ])
    )
    .addCollection(nga.collection(pitcher_workload)
        .title('Pitcher Workload')
        .fields([
            nga.field('pitcher', 'reference')
                .label('Pitcher')
                .targetEntity(pitchers)
                .targetField(nga.field('unique_id')),
            nga.field('dt_create', 'date').label('Created').format('short'),
        ])
    )
    .addCollection(nga.collection(pitching_data)
        .title('Pitching Data')
        .fields([
            nga.field('pitcher', 'reference')
                .label('Pitcher')
                .targetEntity(pitchers)
                .targetField(nga.field('unique_id')),
            nga.field('dt_create', 'date').label('Created').format('short'),
        ])
    )
);    

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