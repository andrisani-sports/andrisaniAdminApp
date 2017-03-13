module.exports = {
    entry: "./main.js",
    output: {
        path: __dirname + '/bundle',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            // As we include HTML templates using require to prevent the AJAX request implied by 
            // templateUrl, you will need to configure your module bundler to deal with HTML.
            { test: /\.html$/, loader: 'html' },
        ]
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};