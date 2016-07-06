import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path'

let noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

const config = {
  devtool: 'source-map',

  entry: {
    wail:  "./src/wail" ,
    newCrawl:  "./src/childWindows/newCrawl/newCrawl" ,
    accessibility: './src/background/accessibility',
    indexer: './src/background/indexer',
    jobs: './src/background/jobs',
  },

  output: {
    path: path.join(__dirname, 'dist'),
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
        loader: 'babel-loader',
        query: {
          presets: [ 'es2015', 'stage-0', 'node6', 'react'],
          plugins: [ 'transform-runtime', "add-module-exports",
            "babel-plugin-transform-decorators-legacy", 'transform-class-properties', 'react-html-attrs',
          ],
        },
      },
      { test: /\.css$/, loader: "style!css" },
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
        loader: 'raw',
      }
    ]
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  target: 'electron-renderer'
}

export default config