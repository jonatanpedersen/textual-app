module.exports = {
    entry: "./src/public/index.js",
    output: {
        path: __dirname,
        filename: "./src/public/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
