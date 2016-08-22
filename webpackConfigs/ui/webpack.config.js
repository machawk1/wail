import webpack from 'webpack'
import path from 'path'

const noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

export default {
  devtool: 'inline-source-map',
  entry: {
    accessibility: './wail-ui/background/accessibility',
    indexer: './wail-ui/background/indexer',
    jobs: './wail-ui/background/jobs',
    newCrawl: './wail-ui/childWindows/newCrawl/newCrawl',
    requestD: './wail-ui/background/requestDaemon',
    settingsW: './wail-ui/childWindows/settings/settingsW',
    wail: './wail-ui/wail',
    firstLoad: './wail-ui/loadingScreens/firstTime/loadingScreen',
    notFirstLoad: './wail-ui/loadingScreens/notFirstTime/notFirstLoad'
    // timemapStats: './src/childWindows/timemapStats/timemapStats'
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
  // resolve: {
  //   extensions: [ '', '.webpack.js', '.web.js', '.js', '.jsx', '.json' ],
  // },
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
  // bail: true,
  target: 'electron-renderer',
}
