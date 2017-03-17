const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

const babelEnvConfig = ['env', {
  'targets': {
    'electron': 1.6
  },
  "useBuiltIns": true,
  'include': [
    'syntax-trailing-function-commas'
  ],
  'exclude': [
    'transform-async-to-generator'
  ]
}]

module.exports = {
  devtool: 'source-map',
  entry: {
    archiveMan: './wail-ui/background/js/archives',
    crawlMan: './wail-ui/background/js/crawls',
    firstLoad: './wail-ui/loadingScreens/firstTime/loadingScreen',
    notFirstLoad: './wail-ui/loadingScreens/notFirstTime/notFirstLoad',
    newCrawl: './wail-ui/childWindows/newCrawl/newCrawl',
    requestD: './wail-ui/background/js/requestDaemon',
    twitterM: './wail-ui/background/js/twitterM',
    archiver: './wail-ui/background/js/archiver',
    settingsW: './wail-ui/childWindows/settings/settingsW',
  },
  module: {
    noParse: noParseRe,
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            babelEnvConfig,
            'react'
          ],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-es2015-destructuring',
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
  resolve: {
    alias: {
      'dtrace-provider': './wail-ui/bunyanshim.js'
    }
  },
  externals: [
    'fsevents'
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './wail-twitter/archive/inject.js'
    }]),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  ],
  output: {
    path: './dist',
    filename: '[name].bundle.js',
    publicPath: './dist/',
    libraryTarget: 'commonjs2'
  },
  // bail: true,
  target: 'electron-renderer',
}
