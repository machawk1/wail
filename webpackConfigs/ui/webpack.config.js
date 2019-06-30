const webpack = require('webpack')
const path = require('path')

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

const babelEnvConfig = ['env', {
  'targets': {
    'electron': '1.8.1'
  },
  "modules": false,
  'debug': true,
  'useBuiltIns': true,
  'include': [
    'syntax-trailing-function-commas',
    'transform-es2015-classes',
    'transform-es2015-object-super'
  ],
  'exclude': [
    'transform-async-to-generator',
    'web.timers',
    'web.immediate'
  ]
}]

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    wail: './wail-ui/wail'
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
          presets: [babelEnvConfig, 'react', 'react-hmre'],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-es2015-object-super',
            'transform-es2015-destructuring',
            'transform-exponentiation-operator',
            ['transform-object-rest-spread', {'useBuiltIns': true}],
            'syntax-trailing-function-commas',
            'transform-export-extensions',
            'transform-do-expressions',
            'transform-function-bind',
            'add-module-exports'
          ],
        }
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
  externals: ['fsevents'],
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'deps',
    //   minChunks(module, count) {
    //     const context = module.context
    //     return context && context.indexOf('node_modules') >= 0
    //   },
    // }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: 'http://localhost:9000/dist/'
  },
  // bail: true,
  target: 'electron-renderer'
}
