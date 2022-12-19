const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CrossoriginWebpackPlugin = require('./plugins/crossoriginWebpackPlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const resolve = (...arg) => path.resolve(__dirname, ...arg);

// 构造注入到项目的全局变量
const getEnvConfig = () => {
  const envConfig = {};
  const { env } = process;
  for (const key in env) {
    if (key.startsWith('REACT') || key.startsWith('PUBLIC')) {
      envConfig[key] = JSON.stringify(env[key]);
    }
  }
  return envConfig;
};
const config = {
  entry: './src/index.ts',
  stats: {
    chunks: false,
    assetsSpace: 1,
    moduleAssets: false,
    modules: false,
    builtAt: true,
    timings: true,
    hash: true,
  },
  target: 'web',
  output: {
    publicPath: process.env.PUBLIC_URL_ROOT,
    path: resolve('../build'),
    assetModuleFilename: 'assets/[name].[contenthash:4][ext]',
    clean: true,
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: resolve('../.webpack_build_cache'),
    maxAge: 5 * 24 * 60 * 60 * 1000,
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg|jpeg|gif|woff|woff2|eot|ttf)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@src': resolve('../src'),
    },
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/public/index.html',
      publicPath: process.env.PUBLIC_URL_ROOT,
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/public/favicon.ico', to: './' },
        { from: './src/public/logo.png', to: './' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': getEnvConfig(),
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new CrossoriginWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.ProgressPlugin({ percentBy: 'entries' }),
  ],
  performance: {
    hints: false,
  },
};
if (process.env.ANALYSER) {
  config.plugins.push(new BundleAnalyzerPlugin());
}
module.exports = config;
