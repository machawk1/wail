import webpack from 'webpack'
import path from 'path'

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

export default {
  devtool: 'eval-source-map',
  entry: {
    archiveMan: ['babel-polyfill','./wail-ui/background/js/archives'],
    crawlMan: ['babel-polyfill','./wail-ui/background/js/crawls'],
    firstLoad: './wail-ui/loadingScreens/firstTime/loadingScreen',
    newCrawl: ['babel-polyfill','./wail-ui/childWindows/newCrawl/newCrawl'],
    notFirstLoad: ['babel-polyfill','./wail-ui/loadingScreens/loading/entry'],
    requestD: ['babel-polyfill', './wail-ui/background/js/requestDaemon'],
    settingsW: './wail-ui/childWindows/settings/settingsW',
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
          presets: [ 'latest', 'react', 'stage-0', 'node6' ],
          plugins: [ 'transform-runtime', 'add-module-exports',
            [ "transform-async-to-module-method", {
              "module": "bluebird",
              "method": "coroutine"
            } ],
            'babel-plugin-transform-decorators-legacy', 'transform-class-properties',
            'react-html-attrs',
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
  resolve: {
    alias: {
      'dtrace-provider': './wail-ui/bunyanshim.js'
    }
  },
  externals: [
    'fsevents'
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
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
