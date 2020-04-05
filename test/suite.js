var Hath = require('hath');
var report = require('hath-report-spec');
var mysql = require('mysql');
var mysql2 = require('mysql2');
var complianceTests = require('marv-compliance-tests');
var driverTests = require('./driver-tests');
var setup = require('./setup');

require('hath-assert')(Hath);

module.exports = Hath.suite('All Tests', [
  buildSuite('MySQL 5 (mysql)', mysql, 3306),
  buildSuite('MySQL 5 (mysql2)', mysql2, 3306),
  buildSuite('MySQL 8 (mysql)', mysql, 3307),
  buildSuite('MySQL 8 (mysql2)', mysql2, 3308),

]);

function buildSuite(name, mysql, port) {
  return Hath.suite(name, [
    setup(mysql, port),
    complianceTests,
    driverTests
  ]);
};



if (module === require.main) {
  module.exports(new Hath(report));
}
