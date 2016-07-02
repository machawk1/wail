var debug = process.env.NODE_ENV !== "production"
var webpack = require('webpack')
var path = require('path')

var noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

module.exports = {

  entry: {
    wail: [ "babel-polyfill", "./src/wail" ],
    accessibility: './src/background/accessibility',
    indexer: './src/background/indexer',
    jobs: './src/background/jobs',
  },
  module: {
    noParse: noParseRe,
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [ 'es2015', 'stage-0', 'node6', 'react', "react-hmre" ],
          plugins: [ 'transform-runtime', "add-module-exports",
            "babel-plugin-transform-decorators-legacy", 'transform-class-properties', 'react-html-attrs',
          ],
        },
      },
      {
        test: /\.css$/, loaders: [
        'style-loader',
        'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
      ]
      },
      {
        test: /\.scss$/,
        loaders: [ 'style!css!less|scss', 'style-loader',
          'css-loader?sourceMap' ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ico)$/,
        loader: 'url-loader?limit=10000',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.(eot|ttf|wav|mp3|tex)$/,
        loader: 'file-loader',
      }, {
        test: /\.(txt|xml|cxml)$/,
        loader: 'raw',
      }
    ]

  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: "[id].chunk.js",
    publicPath: 'http://localhost:9000/dist/'
  },
  target: 'electron-renderer',

}
