var webpack = require('webpack');
var clearRequire = require('webpack-clear-require');
clearRequire();
// Some stuff that helped me get through Webpack config:
// https://github.com/davidgovea/webpack-intro/issues/2
// https://github.com/webpack-contrib/imports-loader

module.exports = {
  context: __dirname + '/ng-app',
  entry: {
    app: './app.js',
    vendor: [
      'angular',
      'angular-sanitize',
      'angular-jwt',
      'angular-route',
      'angular-markdown-filter',
      'angular-translate',
      'angular-moment',
      'angular-nvd3',
      'ng-lodash',
      'code-repositories-api-angular'
    ]
  },
  output: {
    path: __dirname + '/public/js/ng-app',
    filename: 'app.bundle.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: "vendor", filename: "vendor.bundle.js" }),
  ],
  // module: {
  //   loaders: [
  //     {
  //       loader: "imports-loader?this=>window"
  //     }
  //   ]
  // },
  cache: false
};