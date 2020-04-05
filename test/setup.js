var driver = require('..');
var mysql2 = require('mysql2');

module.exports = function(mysql, port) {
  return function setup(t, done) {
    var config = {
      table: 'mysql_migrations',
      mysql: mysql,
      connection: {
        host: 'localhost',
        port: port,
        database: 'marv_tests',
        user: 'root',
        password: '',
        multipleStatements: true,
        timezone: '+00:00',
      }
    };
    t.locals.config = config;
    t.locals.driver = driver(config);
    t.locals.driver2 = driver(config);
    t.locals.migrations = {
      simple: {
        level: 1,
        comment: 'test migration',
        script: 'SELECT 1',
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0'
      },
      namespace: {
        level: 1,
        comment: 'test migration',
        script: 'SELECT 1',
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0',
        namespace: 'so-special'
      },
      comment: {
        level: 2,
        comment: 'do not use',
        script: [
          '-- @MARV foo = bar\n',
          '-- @MARV COMMENT = override\n',
          'SELECT 1'
        ].join('\n'),
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0'
      },
      audit: {
        level: 3,
        comment: 'test migration',
        script: [
          '-- @MARV foo = bar\n',
          '-- @MARV AUDIT   = false\n',
          'SELECT 1'
        ].join('\n'),
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0'
      },
      skip: {
        level: 4,
        comment: 'test migration',
        script: [
          '-- @MARV foo = bar\n',
          '-- @MARV SKIP   = true\n',
          'INVALID'
        ].join('\n'),
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0'
      },
      fail: {
        level: 5,
        comment: 'failing migration',
        script: 'INVALID',
        timestamp: new Date('2016-12-01T15:14:13.000Z'),
        checksum: '401f1b790bf394cf6493425c1d7e33b0'
      }
    };
    t.locals.migration = t.locals.migrations.simple;
    var connection = mysql2.createConnection({ user: 'root', port: port });
    connection.connect(function(err) {
      if (err) throw err;
      connection.query('CREATE DATABASE IF NOT EXISTS marv_tests', function(err) {
        if (err) throw err;
        connection.end(done);
      });
    });
  };
};
