const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

const here = process.cwd()

const babelEnvConfig = ['env', {
  'targets': {
    'electron': '1.7.5'
  },
  "useBuiltIns": true,
  'include': [
    'syntax-trailing-function-commas',
  ],
  'exclude': [
    'transform-async-to-generator',
    'web.timers',
    'web.immediate'
  ]
}]

module.exports = {
  devtool: 'source-map',

  entry: {
    wail: path.join(here,'wail-ui','wail')
  },

  output: {
    filename: '[name].bundle.js',
    path: path.join(here,'dist'),
    publicPath: path.join(here,'dist'),
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
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          babelrc: false,
          presets: [
            babelEnvConfig,
            'react',
          ],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-es2015-destructuring',
            'transform-exponentiation-operator',
            ['transform-object-rest-spread', {'useBuiltIns': true}],
            'syntax-trailing-function-commas',
            'transform-export-extensions',
            'transform-do-expressions',
            'transform-function-bind',
            'add-module-exports',
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
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
  externals: ['fsevents'],
  resolve: {
    alias: {
      'dtrace-provider': './wail-ui/bunyanshim.js'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      'Promise': 'bluebird'
    }),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.WAILTEST': false,
    }),
    new ExtractTextPlugin({
      allChunks: true
    })
  ],
  target: 'electron-renderer'
}
