module.exports = function() {
  var config = {
    srcTS: './src/**/*.ts',
    srcViews: './views/**/*.hbs',
    srcStyles: './public/styles/src/**/*.css',
    destTS: './dest/',
    destStyles: './public/styles/'
  };

  return config;
}