const webpack = require('webpack')
const path = require('path')

const here = process.cwd()

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

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

  entry: path.join(here, 'wail-ui', 'ui-main.js'),
  output: {
    filename: 'ui-main.js',
    path: path.join(here, 'dist'),
    publicPath: path.join(here, 'dist'),
    libraryTarget: 'commonjs2'
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.WAILTEST': false,
    }),
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
