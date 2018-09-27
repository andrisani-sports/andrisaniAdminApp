module.exports = function(nga,issues,user) {

	// LIST VIEW
  issues.listView()
	  .title('All App Issues')
	  .fields([
	      nga.field('message')
					.label('Issue'),
	      nga.field('dt_create', 'date').label('Created').format('short'),
	  ])
	  .listActions(['show','delete'])
	  .filters([
	      nga.field('email')
	          .pinned(true)
	          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
	  ])

  // SHOW VIEW
  issues.showView()
	  .title('App Issue')
	  .fields([
		nga.field('id'),
		nga.field('dt_create', 'date').label('Created').format('short'),
		nga.field('dt_update', 'date').label('Updated').format('short'),
		nga.field('name')
			.label('User'),
        nga.field('email')
        	.label('User Email'),
        nga.field('message')
        	.label('Issue')
		])
    
    // DELETION VIEW
    issues.deletionView()
     .title('Delete Issue')

    return issues;
};