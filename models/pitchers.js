module.exports = function(nga,pitchers,teams,user) {

	// LIST VIEW
  pitchers.listView()
	  .title('All Pitchers')
	  .fields([
	      nga.field('unique_id')
	      	.label('Pitcher'),
	      nga.field('team', 'reference')
					.label('Team')
          .targetEntity(teams)
          .targetField(nga.field('name')),
	      nga.field('dt_create', 'date').label('Created').format('short'),
	      nga.field('dt_update', 'date').label('Updated').format('short'),
	  ])
	  .listActions(['show','delete'])
	  .filters([
	      nga.field('name')
	          .pinned(true)
	          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
	  ])

  // SHOW VIEW
  pitchers.showView()
	  .title('"{{ entry.values.unique_id }}"')
	  .fields([
	      // nga.field('id'),
	      nga.field('unique_id').label('Unique ID'),
				nga.field('dt_create', 'date').label('Created').format('short'),
				nga.field('dt_update', 'date').label('Updated').format('short'),
				// nga.field('name'),
				nga.field('age'),
				nga.field('height').label('Height (inches)'),
				nga.field('weight').label('Weight (lbs)'),
				nga.field('stride_length').label('Stride Length (inches)'),
				nga.field('device_height').label('Device Height (inches)'),
				nga.field('team', 'reference')
					.label('Team')
          .targetEntity(teams)
          .targetField(nga.field('name')),
				nga.field('baselines', 'json')
		])


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
    pitchers.deletionView()
     .title('Delete "{{ entry.values.unique_id }}"')

    return pitchers;
};