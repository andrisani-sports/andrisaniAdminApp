
module.exports = function(nga,pitching_data,pitchers,pitcher_workload,user) {

	var listViewActionsTemplate = '<upload-excel-button entry="entry"></upload-excel-button>' + 
	'<ma-export-to-csv-button entity="::entity" datastore="::datastore"></ma-export-to-csv-button>';

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
	  //.actions(listViewActionsTemplate)

  // SHOW VIEW
  pitching_data.showView()
	.title('Pitching Data')
	.fields([
	    nga.field('id'),
		nga.field('dt_create', 'date').label('Created').format('short'),
		nga.field('dt_update', 'date').label('Updated').format('short'),
		nga.field('originalPullTimestamp','date').label('Original Creation').format('short'),
		nga.field('pitcher', 'reference')
		  .label('Pitcher')
          .targetEntity(pitchers)
          .targetField(nga.field('unique_id')),
        nga.field('mainValue'),
        nga.field('note', 'wysiwyg'),
        //nga.field('pulls','json')
	])
    
    // DELETION VIEW
    pitching_data.deletionView()
     .title('Delete Pitching Data')

    return pitching_data;
};