module.exports = function(nga,teams,user) {

	var listViewActionsTemplate = '<upload-excel-button entry="entry"></upload-excel-button>' + 
	'<ma-export-to-csv-button entity="::entity" datastore="::datastore"></ma-export-to-csv-button>' +
	'<ma-create-button entity-name="teams" size="md" label="Create" default-values="{ post_id: entry.values.id }"></ma-create-button>';

	// LIST VIEW
  teams.listView()
	  .title('All Teams')
	  .fields([
	      nga.field('name').label('Team Name'),
	      nga.field('dt_create', 'date').label('Created').format('short'),
	      nga.field('dt_update', 'date').label('Updated').format('short'),
	  ])
	  .sortField('name')
	  .sortDir('ASC')
	  .listActions(['show','edit','delete'])
	  .filters([
	      nga.field('name')
	          .label('Team Name')
	          .pinned(true)
	          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
	  ])
	  //.actions(listViewActionsTemplate)

  // SHOW VIEW
  teams.showView()
	  .title('"{{ entry.values.name }}" Team')
	  .fields([
	      nga.field('id'),
				nga.field('dt_create', 'date').label('Created').format('short'),
				nga.field('dt_update', 'date').label('Updated').format('short'),
				nga.field('name'),
				nga.field('note', 'wysiwyg')
		])


    // CREATION VIEW
    teams.creationView()
    	.title('Add Team')
    	.fields([
    		nga.field('name'),
        nga.field('note', 'wysiwyg')
			])


    // EDITION VIEW
    teams.editionView()
    .title('Edit "{{ entry.values.name }}"')
    .fields(teams.creationView().fields());
    
    // DELETION VIEW
    teams.deletionView()
     .title('Delete "{{ entry.values.name }}"')

    return teams;
};