const { Suite } = require('zunit');
const mysql = require('mysql');
const mysql2 = require('mysql2');
const complianceTests = require('marv-compliance-tests');
const driverTestSuite = require('./driver.suite');

const setup = require('./setup');

module.exports = new Suite('All Tests').add([
  buildSuite('MySQL 5 (mysql)', mysql, 3306),
  buildSuite('MySQL 5 (mysql2)', mysql2, 3306),
  buildSuite('MySQL 5 (default)', null, 3306),
  buildSuite('MySQL 8 (mysql)', mysql, 3307),
  buildSuite('MySQL 8 (mysql2)', mysql2, 3308),
  buildSuite('MySQL 8 (default)', null, 3308),
]);

function buildSuite(name, client, port) {
  const hook = setup(client, port);
  return new Suite(name).add(driverTestSuite).add(complianceTests).before(hook);
}
