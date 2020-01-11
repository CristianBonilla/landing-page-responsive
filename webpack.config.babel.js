import path from 'path';
import fs from 'fs';
import {
  // optimize,
  DefinePlugin,
  LoaderOptionsPlugin,
  ProvidePlugin
} from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';

// dart sass
// import sass from 'sass';
// import fibers from 'fibers';

const expression = /^(development|production)$/;
const nodeEnv = process.env.NODE_ENV || 'development';
const nodeEnvValue = expression.test(nodeEnv) ? nodeEnv : 'development';
const isDevelopment = nodeEnvValue.toLowerCase() === 'development';
const isProduction = nodeEnvValue.toLowerCase() === 'production';

const dir = src => path.resolve(__dirname, src);
const paths = {
  src: dir('./src'),
  build: dir('./build'),
  assets: dir('./src/assets')
};

// resolve
const resolve = {
  alias: {
    '@': paths.src,
    '@fonts': path.resolve(paths.assets, 'fonts'),
    '@images': path.resolve(paths.assets, 'images'),
    '@styles': path.resolve(paths.src, 'styles'),
    '@services': path.resolve(paths.src, 'services')
  },
  extensions: [ '.js', '.jsx' ]
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
    // options: {
    //   name: '[name].[ext]?[hash]',
    //   outputPath: 'assets'
    // },
    include: [
      path.resolve(paths.assets, 'fonts')
    ]
  },
  {
    test: /\.(sa|sc|c)ss$/i,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // publicPath: '../',
          hmr: isDevelopment
        }
      },
      'css-loader',
      'sass-loader'
      // -fibers for dart sass
      // {
      //   loader: 'sass-loader',
      //   options: {
      //     implementation: sass,
      //     sassOptions: {
      //       fiber: fibers
      //     }
      //   }
      // }
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
    loader: 'file-loader?name=[name].[ext]?[hash]',
    // options: {
    //   name: '[name].[ext]?[hash]',
    //   outputPath: 'assets'
    // },
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
    filename: isDevelopment ? 'styles/[name].css' : 'styles/[name].[hash].css',
    chunkFilename: isDevelopment ? 'styles/[id].css' : 'styles/[id].[hash].css'
  }),
  new CompressionPlugin(),
  new ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    Popper: 'popper.js'
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(paths.src, 'index.html'),
    favicon: path.resolve(paths.src, 'favicon.ico'),
    hash: isProduction
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
  watchContentBase: true,
  noInfo: false,
  overlay: true,
  port: 12500,
  compress: true
};

const config = {
  entry: [
    path.resolve(paths.src, 'main.js'),
    path.resolve(paths.src, 'styles/_main.scss')
  ],
  output: {
    path: paths.build,
    publicPath: '/',
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[name].js'
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
