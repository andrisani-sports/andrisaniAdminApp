module.exports = function(nga,injuries,pitchers,user) {

	// LIST VIEW
	injuries.listView()
	  .title('Pitcher Injuries')
	  .fields([
	      nga.field('date_of_injury','date')
			.label('Date').format('short'),
	      nga.field('dt_create', 'date')
	      	.label('Created').format('short'),
	      nga.field('pitcher','reference')
	      	.label('Pitcher')
	      	.targetEntity(pitchers)
          	.targetField(nga.field('name'))
	  ])
	  .listActions(['show','delete','edit'])
	  .filters([
	      nga.field('email')
	          .pinned(true)
	          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
	  ])

	// SHOW VIEW
	injuries.showView()
	.title('Pitcher Injury')
	.fields([
		nga.field('id'),
		nga.field('dt_create', 'date')
			.label('Created').format('short'),
		nga.field('dt_update', 'date')
			.label('Updated').format('short'),
		nga.field('date_of_injury')
			.label('Date of Injury'),
		nga.field('pitcher','reference')
			.label('Pitcher')
			.targetEntity(pitchers)
          	.targetField(nga.field('name')),
		nga.field('note','wysiwyg')
			.label('Note')
	])

	// CREATION VIEW
	injuries.creationView()
	.title('Pitcher Injury')
	.fields([
		nga.field('date_of_injury','date')
			.label('Date of Injury'),
		nga.field('pitcher','reference')
			.label('Pitcher')
			.targetEntity(pitchers)
			.targetField(nga.field('name'))
			.sortField('name')
			.sortDir('ASC'),
		nga.field('note','wysiwyg')
			.label('Note')
	])
    
    // DELETION VIEW
    injuries.deletionView()
     .title('Delete Injury');

   // EDITION VIEW
   injuries.editionView()
   .title('Edit Injury')
   .fields(
   		nga.field('date_of_injury','date')
			.label('Date of Injury'),
		nga.field('pitcher','reference')
			.label('Pitcher')
			.targetEntity(pitchers)
			.targetField(nga.field('name')),
		nga.field('note','wysiwyg')
			.label('Note')
	);

    return injuries;
};