var debug = process.env.NODE_ENV !== "production"
var webpack = require('webpack')
var path = require('path')


module.exports = {
  
   entry: {
      wail: path.join(__dirname,"src/wail"),
      // monitors: './src/background/monitor-entry'
      accessibility: path.join(__dirname,'src/background/accessibility'),
      indexer: path.join(__dirname,'src/background/indexer'),
      jobs: path.join(__dirname,'src/background/jobs'),
   },
   module: {
      noParse: /node_modules\\json-schema\\lib\\validate\.js/,
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
               presets: ['react', 'es2015', 'stage-0', 'node6', "react-hmre"],
               plugins: ['react-html-attrs', 'transform-class-properties',
                  'transform-runtime', "add-module-exports","transform-es2015-destructuring"],
            },
         },
         {test: /\.css$/, loader: "style!css"},
         {
            test: /\.scss$/,
            loaders: ['style!css!less|scss', 'style-loader',
               'css-loader?sourceMap']
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
         // {test: /\.tsx?$/, loader: 'webpack-typescript?target=ES6'},
      ]

   },

   plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.DefinePlugin({
         __DEV__: true,
         'process.env.NODE_ENV': JSON.stringify('development'),
         
      }),
   ],
   devtool: 'inline-source-map',
   output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].bundle.js',
      chunkFilename: "[id].chunk.js",
      publicPath: 'http://localhost:9000/dist/'
   },
   target: 'electron-renderer',

}
