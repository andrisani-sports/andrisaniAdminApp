module.exports = function(nga,pitchingData,pitchers,user) {

	// LIST VIEW
  pitchingData.listView()
	  .title('All data')
	  .fields([
	      nga.field('pitcher', 'reference')
			.label('Pitcher')
          	.targetEntity(pitchers)
          	.targetField(nga.field('unique_id')),
	      nga.field('dt_create', 'date').label('Created').format('short'),
	      nga.field('dt_update', 'date').label('Updated').format('short'),
	      nga.field('mainValue'),
	  ])
	  .sortField('pitcher')
	  .sortDir('ASC')
	  .listActions(['show'])
	  .filters([
	      nga.field('pitcher')
	          .pinned(true)
	          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
	  ])

	// SHOW VIEW
	pitchingData.showView()
	.title('"{{ entry.values.mainValue }}"')
	.fields([
		nga.field('id'),
		nga.field('pitcher', 'reference')
			.label('Pitcher')
			.targetEntity(pitchers)
			.targetField(nga.field('unique_id')),
		nga.field('dt_create', 'date').label('Created').format('short'),
		nga.field('dt_update', 'date').label('Updated').format('short'),
		nga.field('mainValue'),
		nga.field('note'),
		nga.field('pulls','json')
	])

    return pitchingData;
};