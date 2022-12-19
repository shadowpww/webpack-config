const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const postcssPresetEnv = require('postcss-preset-env');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const resolve = (...arg) => path.resolve(__dirname, ...arg);

// 测速 speed-measure-webpack-plugin
// 注意：mini-css-extract-plugin 最新版与之不兼容，需回退至1.3.6版本
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();

// css loader
const cssLoader = (isModule, preprocessor) =>
  [
    MiniCssExtractPlugin.loader,
    `css-loader?modules=${isModule}`,
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [postcssPresetEnv({ browsers: 'last 2 versions' })],
        },
      },
    },
    preprocessor && `${preprocessor}-loader`,
  ].filter(Boolean);

const config = {
  mode: 'production',
  output: {
    filename: 'js/[name].[chunkhash:4].js',
    chunkFilename: 'js/[name].[chunkhash:4].js',
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /\/node_modules/,
        include: [resolve('../src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              compact: true,
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
  optimization: {
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '.',
      name(module, chunks, cacheGroupKey) {
        return `${cacheGroupKey}`;
      },
      cacheGroups: {
        styles: {
          type: 'css/mini-extract',
          maxSize: 400000,
          minSize: 100000,
          enforce: true,
          priority: 100,
        },
        'tencent-tea': {
          test: /[\\/]node_modules\/@tencent\/tea-component[\\/]/,
          maxSize: 600000,
          minSize: 400000,
          priority: 100,
        },
        'tencent-sra': {
          test: /[\\/]node_modules\/@tencent\/sra[\\/]/,
          priority: 100,
        },
        // 'antv-data-set': {
        //   test: /[\\/]node_modules\/@antv\/data-set[\\/]/,
        //   priority: 100,
        // },
        antv: {
          test: /[\\/]node_modules\/@antv[\\/]/,
          maxSize: 600000,
          minSize: 400000,
          priority: 90,
        },
        lodash: {
          test: /[\\/]node_modules\/lodash.*[\\/]/,
          priority: 100,
        },
        'cos-js-sdk-v5': {
          test: /[\\/]node_modules\/cos-js-sdk-v5[\\/]/,
          priority: 100,
        },
        'react-color': {
          test: /[\\/]node_modules\/react-color[\\/]/,
          priority: 100,
        },
        qiankun: {
          test: /[\\/]node_modules\/qiankun[\\/]/,
          priority: 100,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          maxSize: 700000,
          minSize: 500000,
          priority: 80,
        },
        'custom-marketing': {
          test: /[\\/]src\/pages\/customer\/marketing[\\/]/,
          priority: 70,
        },
        'custom-data-analyse': {
          test: /[\\/]src\/pages\/customer\/data-analyse[\\/]/,
          priority: 70,
        },
        'custom-city-code': {
          test: /[\\/]src\/constant\/city_code\.json/,
          priority: 70,
        },
        custom: {
          priority: 20,
        },
      },
    },
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            unused: true,
            drop_console: true,
            inline: 2,
          },
        },
      }),
      new CssMinimizerPlugin({
        exclude: /\/node_modules\/@tencent\/tea-sr\/css\/tea-sr\.css/,
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename: 'css/[name].[contenthash:4].css',
      chunkFilename: 'css/[name].[contenthash:4].css',
    }),
  ],
};
module.exports = merge(common, config);
// module.exports = smp.wrap(merge(common, config));
