var Hath = require('hath');
var marv = require('marv');
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');
var async = require('async');
require('hath-assert')(Hath);

function shouldRunMigration(t, done) {
  const dropTables = load(t, ['sql', 'drop-tables.sql']);
  const client = mysql.createConnection(t.locals.config.connection);
  client.connect(function(err) {
    if (err) throw err;
    client.query(dropTables, function(err) {
      if (err) throw err;
      marv.scan(path.join(__dirname, 'migrations'), function(err, migrations) {
        if (err) throw err;
        marv.migrate(migrations, t.locals.driver, function(err) {
          if (err) throw err;
          client.query('SELECT * FROM foo', function(err, result) {
            if (err) throw err;
            t.assertEquals(result.length, 1);
            t.assertEquals(result[0].id, 1);
            t.assertEquals(result[0].value, 'foo');

            client.query('SELECT * FROM bar', function(err, result) {
              if (err) throw err;
              t.assertEquals(result.length, 1);
              t.assertEquals(result[0].id, 1);
              t.assertEquals(result[0].value, 'bar');
              client.end();
              done();
            });
          });
        });
      });
    });
  });
}

function shouldEnsureNamespaceColumn(t, done) {
  const dropTables = load(t, ['sql', 'drop-tables.sql']);
  const ensureLegacyMigrations = load(t, ['sql', 'ensure-legacy-migrations-tables.sql']);
  const checkNamespace = load(t, ['..', 'sql', 'check-namespace-column.sql']);
  const client = mysql.createConnection(t.locals.config.connection);
  client.connect(function(err) {
    if (err) throw err;
    async.series([
      client.query.bind(client, dropTables),
      client.query.bind(client, ensureLegacyMigrations)
    ], function (err) {
      if (err) throw err;
      marv.scan(path.join(__dirname, 'migrations'), function(err, migrations) {
        if (err) throw err;
        marv.migrate({}, t.locals.driver, function(err) {
          if (err) throw err;
          client.query(checkNamespace, function (err, result) {
            if (err) throw err;
            t.assertEquals(result.length, 1);
            t.assertEquals(result[0].column_default, 'default');
            client.end();
            done();
          });
        });
      });
    });
  });
}

function load(t, location) {
  return fs.readFileSync(path.join.apply(null, [__dirname].concat(location)), 'utf-8').replace(/migrations/g, t.locals.config.table);
}

module.exports = Hath.suite('Driver Tests', [
  shouldRunMigration,
  shouldEnsureNamespaceColumn
]);
