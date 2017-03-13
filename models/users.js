module.exports = function(nga,users,roles) {

    // LIST VIEW
    users.listView()
    .fields([
        nga.field('displayName').label('Username'),
        nga.field('id'),
        nga.field('givenRole', 'reference')
        	.label('User Role')
        	.cssClasses('capitalize')
        	.targetEntity(roles)
        	.targetField(nga.field('name')),
        nga.field('paid', 'boolean')
	        .choices([
	        	{ value: true, label: 'yes'},
	        	{ value: false, label: 'no'}
	        ]),
        nga.field('dt_create', 'date').label('Created').format('short')
    ])
    .sortField('displayName')
    .sortDir('ASC')
    .listActions(['show','edit','delete'])
    .filters([
        nga.field('_id')
        ,nga.field('displayName')
            .label('User Name')
            .pinned(true)
            .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
        ,nga.field('email')
            .label('Email')
    ]);;

    // SHOW VIEW
    users.showView()
    .title('"{{ entry.values.displayName }}" Profile')
    .fields([
        nga.field('id'),
        // nga.field('givenrole','change_role_dropdown')
        //     .label('Role'),
        nga.field('dt_create', 'date').label('Created').format('short'),
        	nga.field('dt_update', 'date').label('Last Update').format('short'),
        nga.field('firstName'),
        nga.field('lastName'),
        nga.field('displayName').label('Username'),
        nga.field('publicEmail').label('Email'),
        nga.field('profile', 'template')
        	.label('Profile Image')
        	.template('<img src="{{ entry.values.profile }}" style="max-width: 50px; height: auto;" />'),
        nga.field('paid', 'boolean').choices([
        	{ value: true, label: 'yes'},
        	{ value: false, label: 'no'}
        ])
    ]);

    // CREATION VIEW
    users.creationView()
    .fields([
        nga.field('firstName'),
        nga.field('lastName'),
        nga.field('displayName'),
        // nga.field('email','stamplay_email_field')
        //     .template('<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>',true)
        //     .cssClasses('hidden-email'),
        nga.field('publicEmail')
            .validation({ required: true })
            .label('Email'),
        nga.field('password'),
        // nga.field('givenrole','change_role_dropdown')
        //     .label('Role'),
        nga.field('paid', 'boolean')
        	.choices([
        		{ value: true, label: 'Yes'},
        		{ value: false, label: 'No'}
        	])
    ])
    .prepare((entry) => {
        // entry.values.email = entry.values.publicEmail;
        entry.values.email = 'test@test.com';
    });

    // EDITION VIEW
    users.editionView()
    .title('Edit "{{ entry.values.displayName }}"')
    .fields(users.creationView().fields());
    
    // DELETION VIEW
    users.deletionView()
     .title('Delete "{{ entry.values.displayName }}"')

    return users;

};