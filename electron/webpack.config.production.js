import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path'

const config = {
   devtool: 'source-map',

   entry: './src/wail',

   output: {
      // filename: "main.js",
      filename: 'bundle.js',
      path: path.join(__dirname, 'dist'),
      publicPath: '../dist/'
   },

   module: {
      noParse: /node_modules\/json-schema\/lib\/validate\.js/,

      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
               presets: ['react', 'es2015', 'stage-0', 'node6'],
               plugins: ['react-html-attrs', 'transform-class-properties',
                  'transform-runtime', "add-module-exports"],
            },
         }, {test: /\.css$/, loader: "style!css"},
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
      ]
   },

   plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.DefinePlugin({
         __DEV__: false,
         'process.env': {
            NODE_ENV: JSON.stringify('production')
         }
      }),
      new webpack.optimize.UglifyJsPlugin({
         compressor: {
            screw_ie8: true,
            warnings: false
         }
      }),
      new ExtractTextPlugin('style.css', {allChunks: true})
   ],

   target: 'electron-renderer'
};

export default config;