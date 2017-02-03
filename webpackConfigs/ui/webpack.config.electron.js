const webpack = require('webpack')
const path = require('path')

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

const babelEnvConfig = ['env', {
  'targets': {
    'electron': 1.4
  },
  "useBuiltIns": true,
  'include': [
    'syntax-trailing-function-commas',
    'transform-es2015-destructuring'
  ]
}]

module.exports = {
  module: {
    noParse: noParseRe,
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            babelEnvConfig,
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
        }
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
      },]
  },
  devtool: 'source-map',

  entry: './wail-ui/ui-main.js',
  output: {
    filename: 'ui-main.js',
    path: './dist',
    publicPath: './dist/',
    libraryTarget: 'commonjs2'
  },

  plugins: [
    new webpack.BannerPlugin(
      {banner: 'require("source-map-support").install();', raw: true, entryOnly: false}
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        WAILTEST: false
      }
    })
  ],

  target: 'electron-main',

  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    alias: {
      'dtrace-provider': './wail-ui/bunyanshim.js'
    }
  },
  externals: [
    'source-map-support',
    'material-design-icons-iconfont',
    'roboto-fontface',
    'fsevents',
    'electron-window'
  ],
}
