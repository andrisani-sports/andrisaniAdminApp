// run "npm install admin-config --save-dev"
// need to have a build tool transpile ES6 to regular javascript (browserify / babelify)

import TextField from 'admin-config/lib/Field/TextField';

class StamplayEmailFieldConfig extends TextField {
    constructor(name) {
        super(name);
        this._type = "stamplay_email_field";
    }
    // this comes from an entity definition file, when the pagezone field type is invoked, this function 
    // can be used in the definition file to pass parameters to this class
    sampleFunction(sampleParam) {
        if (!arguments.length) return this._sampleParam;
        this._sampleParam = sampleParam;
        return this;
    }
}

export default StamplayEmailFieldConfig;