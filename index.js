var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var format = require('util').format;
var debug = require('debug')('marv:mysql-driver');
var marv = require('marv');
var supportedDirectives = ['audit', 'comment', 'skip'];
var pkg = require('./package.json');

module.exports = function(options) {

  var config = _.merge({ table: 'migrations', connection: {} }, _.omit(options, 'logger'));
  var logger = options.logger || console;
  var SQL = {
    ensureMigrationsTables: load('ensure-migrations-tables.sql'),
    checkNamespaceColumn: load('check-namespace-column.sql'),
    addNamespaceColumn: load('add-namespace-column.sql'),
    retrieveMigrations: load('retrieve-migrations.sql'),
    dropMigrationsTables: load('drop-migrations-tables.sql'),
    lockMigrationsLockTable: load('lock-migrations-lock-table.sql'),
    unlockMigrationsLockTable: load('unlock-migrations-lock-table.sql'),
    insertMigration: load('insert-migration.sql')
  };
  var mysql = config.mysql || require('mysql');
  var lockClient;
  var userClient;
  var migrationClient;

  function connect(cb) {
    lockClient = mysql.createConnection(config.connection);
    migrationClient = mysql.createConnection(_.merge({}, config.connection, { timezone: 'utc', charset: 'utf8_general_ci', multipleStatements: true }));
    userClient = mysql.createConnection(config.connection);
    debug('Connecting to %s', getLoggableUrl());
    async.series([
      lockClient.connect.bind(lockClient),
      migrationClient.connect.bind(migrationClient),
      userClient.connect.bind(userClient)
    ], guard(cb));
  }

  function disconnect(cb) {
    debug('Disconnecting from %s', getLoggableUrl());
    async.series([
      lockClient.end.bind(lockClient),
      migrationClient.end.bind(migrationClient),
      userClient.end.bind(userClient)
    ], guard(cb));
  }

  function dropMigrations(cb) {
    migrationClient.query(SQL.dropMigrationsTables, guard(cb));
  }

  function ensureMigrations(cb) {
    async.series([
      migrationClient.query.bind(migrationClient, SQL.ensureMigrationsTables),
      migrationClient.query.bind(migrationClient, SQL.checkNamespaceColumn)
    ], ensureNamespace);

    function ensureNamespace(err, results) {
      if (err) return cb(err);
      if (_.chain(results).last().first().value().length === 0) {
        migrationClient.query(SQL.addNamespaceColumn, guard(cb));
      } else {
        cb();
      }
    }
  }

  function lockMigrations(cb) {
    lockClient.query(SQL.lockMigrationsLockTable, guard(cb));
  }

  function unlockMigrations(cb) {
    lockClient.query(SQL.unlockMigrationsLockTable, guard(cb));
  }

  function getMigrations(cb) {
    migrationClient.query(SQL.retrieveMigrations, function(err, result) {
      if (err) return cb(err);
      cb(null, result);
    });
  }

  function runMigration(_migration, cb) {
    var migration = _.merge({}, _migration, { directives: marv.parseDirectives(_migration.script) });

    checkDirectives(migration.directives);

    if (/^true$/i.test(migration.directives.skip)) {
      debug('Skipping migration %s: %s\n%s', migration.level, migration.comment, migration.script);
      return cb();
    }

    debug('Run migration %s: %s\n%s', migration.level, migration.comment, migration.script);
    userClient.query(migration.script, function(err) {
      if (err) return cb(decorate(err, migration));
      if (auditable(migration)) {
        return migrationClient.query(SQL.insertMigration, [
          migration.level,
          migration.directives.comment || migration.comment,
          migration.timestamp,
          migration.checksum,
          migration.namespace || 'default'
        ], function(err) {
          if (err) return cb(decorate(err, migration));
          cb();
        });
      }
      cb();
    });
  }

  function checkDirectives(directives) {
    var unsupportedDirectives = _.chain(directives).keys().difference(supportedDirectives).value();
    if (unsupportedDirectives.length === 0) return;
    if (!config.quiet) {
      logger.warn('Ignoring unsupported directives: %s. Try upgrading %s.', unsupportedDirectives, pkg.name);
    }
  }

  function auditable(migration) {
    if (migration.hasOwnProperty('directives')) return !/^false$/i.test(migration.directives.audit);
    if (migration.hasOwnProperty('audit')) {
      if (!config.quiet) logger.warn("The 'audit' option is deprecated. Please use 'directives.audit' instead.");
      return migration.audit !== false;
    }
    return true;
  }

  function getLoggableUrl() {
    return format('mysql://%s:%s@%s:%s/%s', userClient.config.user, '******', userClient.config.host, userClient.config.port, userClient.config.database);
  }

  function load(filename) {
    return fs.readFileSync(path.join(__dirname, 'sql', filename), 'utf-8').replace(/migrations/g, config.table);
  }

  function decorate(err, migration) {
    return _.merge(err, { migration: migration });
  }

  function guard(cb) {
    return function(err) {
      cb(err);
    };
  }

  return {
    connect: connect,
    disconnect: disconnect,
    dropMigrations: dropMigrations,
    ensureMigrations: ensureMigrations,
    lockMigrations: lockMigrations,
    unlockMigrations: unlockMigrations,
    getMigrations: getMigrations,
    runMigration: runMigration
  };
};
