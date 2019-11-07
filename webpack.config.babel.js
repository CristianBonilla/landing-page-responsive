import path from 'path';
import fs from 'fs';
import {
  // optimize,
  DefinePlugin,
  LoaderOptionsPlugin
} from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';

const expression = /^(development|production)$/;
const nodeEnv = process.env.NODE_ENV || 'development';
const nodeEnvValue = expression.test(nodeEnv) ? nodeEnv : 'development';
const isDevelopment = nodeEnvValue.toLowerCase() === 'development';
const isProduction = nodeEnvValue.toLowerCase() === 'production';

const dir = (src) => (path.resolve(__dirname, src));
const paths = {
  src: dir('./src'),
  build: dir('./build'),
  assets: dir('./src/assets')
};

// resolve
const resolve = {
  alias: {
    '@fonts': path.resolve(paths.assets, '/fonts'),
    '@images': path.resolve(paths.assets, '/images'),
    '@styles': path.resolve(paths.src, '/styles')
  },
  extensions: ['*', '.js', '.json']
};

const babelrcFile = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, './.babelrc')
  )
);

// rules
const rules = [
  {
    test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/,
    loader: 'file-loader?name=[name].[ext]?[hash]',
    include: [
      path.resolve(paths.assets, '/fonts')
    ]
  },
  {
    test: /\.css$/i,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: isDevelopment
        }
      },
      'css-loader'
    ]
  },
  {
    test: /\.js$/i,
    loader: 'babel-loader',
    exclude: /^node_modules|tests|build|dist$/i,
    options: {
      ...babelrcFile
    }
  },
  {
    test: /\.ico|png|gif|jpg|svg$/i,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]?[hash]'
    },
    exclude: /^node_modules$/
  },
  {
    test: /\.js$/i,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: paths.src,
    options: {
      emitError: true
    }
  }
];

// plugins
const plugins = [ /* defaults */
  new MiniCssExtractPlugin({
    filename: isDevelopment ? '[name].css' : '[name].[hash].css',
    chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
  }),
  new CompressionPlugin(),
  new HtmlWebpackPlugin({
    template: path.resolve(paths.src, 'index.html')
  }),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: 'defer'
  })
];

if (isProduction) {
  plugins.push(new DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }), new LoaderOptionsPlugin({
    minimize: true
  }));
}

// devServer
const devServer = {
  contentBase: paths.src,
  historyApiFallback: true,
  noInfo: false,
  overlay: true,
  port: 12500
  // publicPath: path.resolve(paths.src, 'assets')
};

const config = {
  entry: [
    path.resolve(paths.src, 'main.js'),
    path.resolve(paths.src, 'styles/_main.css')
  ],
  output: {
    path: paths.build,
    publicPath: '/build',
    filename: 'bundle.js'
  },
  module: {
    rules
  },
  resolve,
  plugins,
  devServer,
  performance: {
    hints: false
  },
  devtool: isDevelopment ? '#eval-source-map' : '#source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        test: /\.js(\?.*)?$/i
      })
    ]
  }
};

export default config;
