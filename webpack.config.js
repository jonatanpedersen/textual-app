module.exports = {
    entry: "./public/app/index.js",
    output: {
        path: __dirname,
        filename: "./public/app/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
