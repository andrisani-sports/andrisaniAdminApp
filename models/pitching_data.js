
module.exports = function(nga,pitching_data,pitchers,pitcher_workload,user) {

	// LIST VIEW
  pitching_data.listView()
	  .title('All Pitching Data')
	  .fields([
	      nga.field('pitcher', 'reference')
					.label('Pitcher')
          .targetEntity(pitchers)
          .targetField(nga.field('unique_id')),
	      nga.field('dt_create', 'date').label('Created').format('short'),
	      nga.field('dt_update', 'date').label('Updated').format('short'),
	  ])
	  .listActions(['show','delete'])
	  .filters([
	      nga.field('unique_id')
	  ])

  // SHOW VIEW
  pitching_data.showView()
	.title('Pitching Data')
	.fields([
	    nga.field('id'),
		nga.field('dt_create', 'date').label('Created').format('short'),
		nga.field('dt_update', 'date').label('Updated').format('short'),
		nga.field('pitcher', 'reference')
		  .label('Pitcher')
          .targetEntity(pitchers)
          .targetField(nga.field('unique_id')),
        nga.field('pulls','json'),
        nga.field('note', 'wysiwyg')
	])
    
    // DELETION VIEW
    pitching_data.deletionView()
     .title('Delete Pitching Data')

    return pitching_data;
};