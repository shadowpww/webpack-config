const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = (...arg) => path.resolve(__dirname, ...arg);

const dllListMap = {
  citycode: [resolve('../src/constant/city_code.json')],
  andv: ['@antv/data-set', '@antv/g2'],
  react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  moment: ['moment'],
  tencent: ['@tencent/aegis-web-sdk', '@tencent/sra', '@tencent/tea-component'],
};

// css loader
const cssLoader = (isModule, preprocessor) => {
  const loaderList = ['style-loader', `css-loader?modules=${isModule}`];
  preprocessor && loaderList.push(`${preprocessor}-loader`);
  return loaderList;
};

module.exports = {
  mode: 'production',
  entry: dllListMap,
  output: {
    filename: 'dll.[name].js',
    path: resolve('./dll'),
    library: 'dll_[name]',
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        include: path.resolve('./src'),
        use: ['babel-loader'],
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
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css',
    }),
    new webpack.ProgressPlugin(),
    new webpack.DllPlugin({
      context: resolve('..'),
      path: resolve('./dll/manifest/[name].manifest.json'),
      name: 'dll_[name]',
      entryOnly: true,
    }),
  ],
};
