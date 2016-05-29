var webpack = require('webpack');

module.exports = {
    entry: "./public/index.js",
    output: {
        path: __dirname + '/public',
        filename: "./bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2017'],
                    plugins: ['transform-runtime']
                }
            },
            { test: /\.scss$/, loaders: ["style", "css", "sass"] },
            { test: /\.css$/, loaders: ["style", "css"] },
            { test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'url?limit=1048576' }
        ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        'Promise': 'exports?global.Promise!es6-promise',
        'fetch': 'exports?self.fetch!whatwg-fetch'
      })
  ]
};
