const Hath = require('hath');
const report = require('hath-report-spec');
const mysql = require('mysql');
const mysql2 = require('mysql2');
const complianceTests = require('marv-compliance-tests');
const driverTests = require('./driver-tests');
const setup = require('./setup');

require('hath-assert')(Hath);

module.exports = Hath.suite('All Tests', [
  buildSuite('MySQL 5 (mysql)', mysql, 3306),
  buildSuite('MySQL 5 (mysql2)', mysql2, 3306),
  buildSuite('MySQL 5 (default)', null, 3306),
  buildSuite('MySQL 8 (mysql)', mysql, 3307),
  buildSuite('MySQL 8 (mysql2)', mysql2, 3308),
  buildSuite('MySQL 8 (default)', null, 3308),

]);

function buildSuite(name, mysql, port) {
  return Hath.suite(name, [
    setup(mysql, port),
    complianceTests,
    driverTests,
  ]);
}



if (module === require.main) {
  module.exports(new Hath(report));
}
