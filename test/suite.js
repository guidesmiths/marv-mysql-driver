var Hath = require('hath');
var report = require('hath-report-spec');
var mysql5 = require('./mysql-5');
var mysql8 = require('./mysql-8');
require('hath-assert')(Hath);

module.exports = Hath.suite('All Tests', [
  mysql5,
  mysql8,
]);

if (module === require.main) {
  module.exports(new Hath(report));
}
