const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const { optimize, NamedModulesPlugin, ContextReplacementPlugin } = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const extractCss = new ExtractTextPlugin({
  filename: "[name].css",
  disable: process.env.NODE_ENV !== 'production'
});

module.exports = {
  entry: [path.join(__dirname, 'app', 'index.tsx'), path.join(__dirname, 'app', 'main.sass')],
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '..', 'assets'),
    publicPath: '/assets'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: ['awesome-typescript-loader']
      },
      {
        test: /\.(js|tsx?)$/,
        loader: ['source-map-loader', 'tslint-loader'],
        enforce: 'pre',
        exclude: /node_modules/
      },
      {
        test: /\.sass$/,
        use: extractCss.extract({
          publicPath: '/assets',
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.css$/,
        use: extractCss.extract({
          publicPath: '/assets',
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => module.context && module.context.indexOf('node_modules') !== -1
    }),
    extractCss,
    new NamedModulesPlugin(),
    new ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    // new BundleAnalyzerPlugin()
  ]
};