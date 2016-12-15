const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

module.exports = {
  devtool: 'source-map',

  entry: './wail-ui/wail',

  output: {
    path: './dist',
    filename: 'wail.bundle.js',
    publicPath: './dist/',
    libraryTarget: 'commonjs2'
  },
  node: {
    __dirname: false,
    __filename: false,
    global: false,
    process: false,
    Buffer: false,
  },
  module: {
    noParse: noParseRe,
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: [
            [ 'env', {
              'targets': {
                'electron': 1.4
              },
              "useBuiltIns": true,
              'include': [
                'transform-class-properties',
                'transform-es2015-destructuring',
                'transform-object-rest-spread'
              ]
            } ],
            'react',
          ],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-es2015-destructuring',
            'transform-async-to-generator',
            'transform-exponentiation-operator',
            'transform-object-rest-spread',
            'syntax-trailing-function-commas',
            'transform-export-extensions',
            'transform-do-expressions',
            'transform-function-bind',
            'add-module-exports',
          ],
        },
      },
      { test: /\.css$/, loader: 'style!css?sourceMap', exclude: /flexboxgrid/ },
      {
        test: /\.css$/,
        loader: 'style!css?sourceMap&modules&localIdentName=[name]__[local]___[hash:base64:5]',
        include: /flexboxgrid/,
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
        loader: 'raw-loader',
      }
    ]
  },
  externals: [ 'fsevents' ],
  resolve: {
    alias: {
      'dtrace-provider': './wail-ui/bunyanshim.js'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      'Promise': 'bluebird'
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  target: 'electron-renderer'
}
