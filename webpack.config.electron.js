import webpack from 'webpack'
import path from 'path'

let noParseRe = process.platform === 'win32' ? /node_modules\\json-schema\\lib\\validate\.js/ : /node_modules\/json-schema\/lib\/validate\.js/

export default {
  module: {
    noParse: noParseRe,
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: [ 'react', 'es2015', 'stage-0', 'node6' ],
          plugins: [ 'react-html-attrs', 'transform-class-properties',
            'transform-runtime', "add-module-exports", 'babel-plugin-transform-remove-console' ],
        },
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
      }, ]
  },
  devtool: 'source-map',

  entry: ['babel-polyfill','./src/electron-main-dev'],
  output: {
    filename: 'electron-main.js',
    path: path.join(__dirname, 'dist'),
    publicPath: './dist/',
    libraryTarget: 'commonjs2'
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.BannerPlugin(
      'require("source-map-support").install();',
      { raw: true, entryOnly: false }
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  target: 'electron-main',

  node: {
    __dirname: false,
    __filename: false
  },

  externals: [
    'source-map-support',
    'material-design-icons-iconfont',
    'roboto-fontface',
  ]
}