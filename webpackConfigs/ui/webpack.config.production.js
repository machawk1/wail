import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import path from 'path'

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

export default {
  devtool: 'source-map',

  entry: {
    // accessibility: './wail-ui/background/accessibility',
    archiveMan: './wail-ui/background/js/archives',
    crawlMan: './wail-ui/background/js/crawls',
    firstLoad: './wail-ui/loadingScreens/firstTime/loadingScreen',
    // indexer: './wail-ui/background/indexer',
    // jobs: './wail-ui/background/jobs',
    // managers: ['babel-polyfill','./wail-ui/background/js/managers'],
    newCrawl: [ 'babel-polyfill', './wail-ui/childWindows/newCrawl/newCrawl' ],
    notFirstLoad: [ 'babel-polyfill', './wail-ui/loadingScreens/loading/entry' ],
    requestD: [ 'babel-polyfill', './wail-ui/background/js/requestDaemon' ],
    settingsW: [ 'babel-polyfill', './wail-ui/childWindows/settings/settingsW' ],
    wail: './wail-ui/wail'
  },

  output: {
    path: './dist',
    filename: '[name].bundle.js',
    publicPath: './dist/',
    libraryTarget: 'commonjs2'
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
          presets: [ 'react', 'electron' ],
          plugins: [
            'transform-react-inline-elements',
            'transform-react-constant-elements',
            'add-module-exports',
            'babel-plugin-transform-decorators-legacy',
            'transform-class-properties',
            'react-html-attrs'
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
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  target: 'electron-renderer'
}
