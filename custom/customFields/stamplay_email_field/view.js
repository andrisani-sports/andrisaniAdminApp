export default {
	// displayed in listView and showView
    getReadWidget:   () => '<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>',
    // displayed in listView and showView when isDetailLink is true
    getLinkWidget:   () => 'Error: this field not applicable to List view or Show view',
    // displayed in the filter form in the listView
    getFilterWidget: () => 'Error: this field not applicable to List view',
    // displayed in editionView and creationView
    getWriteWidget:  () => '<stamplay-email-field field="::field" datastore="::datastore" value="::entry.values[field.name()]" viewtype="edit"></stamplay-email-field>'
}