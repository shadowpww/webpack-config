const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const resolve = (...arg) => path.resolve(__dirname, ...arg);

//测速
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();

// dll 配置
const dllConfig = () => {
  const fs = require('fs');
  const webpack = require('webpack');
  const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
  const plugins = [];
  const dllFiles = fs.readdirSync(resolve('./dll'));
  dllFiles.forEach((item) => {
    if (/^dll\..*\.js$/.test(item)) {
      plugins.push(
        new AddAssetHtmlPlugin({
          filepath: resolve(`./dll/${item}`),
          outputPath: `./dll`,
          publicPath: '/dll/',
        }),
      );
      return;
    }
    if (item === 'manifest' && fs.lstatSync(resolve(`./dll/${item}`)).isDirectory()) {
      fs.readdirSync(resolve(`./dll/${item}`)).forEach((json) => {
        plugins.push(
          new webpack.DllReferencePlugin({
            context: resolve(''),
            manifest: resolve(`./dll/manifest/${json}`),
          }),
        );
      });
    }
  });
  return plugins;
};

// css loader
const cssLoader = (isModule, preprocessor) =>
  ['style-loader', `css-loader?modules=${isModule}&sourceMap`, preprocessor && `${preprocessor}-loader`].filter(
    Boolean,
  );

const config = {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        include: resolve('../src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              compact: true,
              plugins: ['react-refresh/babel'],
            },
          },
        ],
      },
      {
        test: /\.(c|le|sc)ss$/,
        oneOf: [
          {
            test: /\.module\.scss$/,
            use: [...cssLoader(true, 'sass')],
          },
          {
            test: /\.module\.less$/,
            use: [...cssLoader(true, 'less')],
          },
          {
            test: /\.scss$/,
            use: [...cssLoader(false, 'sass')],
          },
          {
            test: /\.less$/,
            use: [...cssLoader(false, 'less')],
          },
          {
            use: [...cssLoader(false)],
          },
        ],
      },
    ],
  },
  devServer: {
    port: 8080,
    hot: true,
    open: true,
    compress: false,
    historyApiFallback: true,
    static: false,
    client: {
      logging: 'info',
      overlay: false,
    },
    proxy: [
      {
        context: ['/mock-proxy'],
        target: `http://localhost:3999`,
        secure: false,
      },
      {
        context: ['/ma-proxy'],
        target: `http://localhost:4001`,
        changeOrigin: true,
        pathRewrite: { '^/ma-proxy': '' },
      },
      {
        context: ['/system-proxy'],
        target: `http://localhost:4000`,
        changeOrigin: true,
        pathRewrite: { '^/ma-proxy': '' },
      },
      {
        context: ['/truth-proxy'],
        target: `http://localhost:4003`,
        changeOrigin: true,
        pathRewrite: { '^/truth-proxy': '' },
      },
    ],
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/,
  },
  plugins: [
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
    // ...dllConfig(),
  ],
};
// module.exports = smp.wrap(merge(common, config));
module.exports = merge(common, config);
