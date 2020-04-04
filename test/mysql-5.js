var Hath = require('hath');
var setup = require('./setup')(3307);
var complianceTests = require('marv-compliance-tests');
var driverTests = require('./driver-tests');

module.exports = Hath.suite('MySQL 5 Tests', [
  setup,
  complianceTests,
  driverTests
]);

