module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['last 1 Chrome versions'],
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
        optimizeConstEnums: true,
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      '@babel/plugin-transform-runtime',
      // {
      //   corejs: false,
      //   regenerator: false,
      // },
    ],
  ],
};
