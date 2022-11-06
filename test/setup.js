const { Hook } = require('zunit');
const mysql2 = require('mysql2');
const driver = require('..');

module.exports = (mysql, port) => new Hook('setup', (hook, done) => {
  const config = {
    table: 'mysql_migrations',
    mysql,
    connection: {
      host: 'localhost',
      port,
      database: 'marv_tests',
      user: 'root',
      password: '',
      multipleStatements: true,
      timezone: '+00:00',
    },
  };
  hook.suite.locals.set('config', config);
  hook.suite.locals.set('driver1', driver(config));
  hook.suite.locals.set('driver2', driver(config));
  hook.suite.locals.set('migrations', {
    simple: {
      level: 1,
      comment: 'test migration',
      script: 'SELECT 1',
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
    },
    namespace: {
      level: 1,
      comment: 'test migration',
      script: 'SELECT 1',
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
      namespace: 'so-special',
    },
    comment: {
      level: 2,
      comment: 'do not use',
      script: [
        '-- @MARV foo = bar\n',
        '-- @MARV COMMENT = override\n',
        'SELECT 1',
      ].join('\n'),
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
    },
    audit: {
      level: 3,
      comment: 'test migration',
      script: [
        '-- @MARV foo = bar\n',
        '-- @MARV AUDIT   = false\n',
        'SELECT 1',
      ].join('\n'),
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
    },
    skip: {
      level: 4,
      comment: 'test migration',
      script: [
        '-- @MARV foo = bar\n',
        '-- @MARV SKIP   = true\n',
        'INVALID',
      ].join('\n'),
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
    },
    fail: {
      level: 5,
      comment: 'failing migration',
      script: 'INVALID',
      timestamp: new Date('2016-12-01T15:14:13.000Z'),
      checksum: '401f1b790bf394cf6493425c1d7e33b0',
    },
  });
  hook.suite.locals.set('migration', hook.suite.locals.get('migrations').simple);
  const connection = mysql2.createConnection({ user: 'root', port });
  connection.connect((err) => {
    if (err) throw err;
    connection.query('CREATE DATABASE IF NOT EXISTS marv_tests', (err) => {
      if (err) throw err;
      connection.end(done);
    });
  });
});
