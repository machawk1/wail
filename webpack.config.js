var webpack = require('webpack')
var path = require('path')

var noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    accessibility: ['babel-polyfill','./src/background/accessibility'],
    indexer: ['babel-polyfill','./src/background/indexer'],
    jobs: ['babel-polyfill','./src/background/jobs'],
    newCrawl: ['babel-polyfill','./src/childWindows/newCrawl/newCrawl'],
    requestD: ['babel-polyfill','./src/background/requestDaemon'],
    settingsW: ['babel-polyfill','./src/childWindows/settings/settingsW'],
    wail: ['babel-polyfill','./src/wail'],
    firstLoad: ['babel-polyfill','./src/loadingScreens/firstTime/loadingScreen'],
    notFirstLoad: ['babel-polyfill','./src/loadingScreens/notFirstTime/notFirstLoad']
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
          presets: [ 'es2015', 'stage-0', 'node6', 'react', 'react-hmre' ],
          plugins: [ 'transform-runtime', 'add-module-exports',
            'babel-plugin-transform-decorators-legacy', 'transform-class-properties',
            'react-html-attrs',
          ],
        },
      },
      { test: /\.css$/, loader: 'style!css' },
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
    modulesDirectories: ['node_modules'],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
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
    chunkFilename: '[id].chunk.js',
    publicPath: 'http://localhost:9000/dist/'
  },
  bail: true,
  target: 'electron-renderer',

}
