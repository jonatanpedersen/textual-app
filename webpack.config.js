var webpack = require('webpack');

module.exports = {
    entry: "./public/index.js",
    output: {
        path: __dirname,
        filename: "./public/bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015'],
                    plugins: ['transform-runtime']
                }
            },
            { test: /\.css$/, loader: "style!css" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        'Promise': 'exports?global.Promise!es6-promise',
        'fetch': 'exports?self.fetch!whatwg-fetch'
      })
  ]
};
