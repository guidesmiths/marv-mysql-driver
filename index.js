const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const { format } = require('util');
const debug = require('debug')('marv:mysql-driver');

const supportedDirectives = ['audit', 'comment', 'skip'];
const pkg = require('./package.json');

module.exports = (options) => {
  const config = _.merge({ table: 'migrations', connection: {} }, _.omit(options, 'logger'));
  const logger = options.logger || console;
  const SQL = {
    ensureMigrationsTables: load('ensure-migrations-tables.sql'),
    checkNamespaceColumn: load('check-namespace-column.sql'),
    addNamespaceColumn: load('add-namespace-column.sql'),
    retrieveMigrations: load('retrieve-migrations.sql'),
    dropMigrationsTables: load('drop-migrations-tables.sql'),
    lockMigrationsLockTable: load('lock-migrations-lock-table.sql'),
    unlockMigrationsLockTable: load('unlock-migrations-lock-table.sql'),
    insertMigration: load('insert-migration.sql'),
  };
  const mysql = getMysql(config);
  let lockClient;
  let userClient;
  let migrationClient;

  function connect(cb) {
    // See https://github.com/sidorares/node-mysql2/issues/1136
    async.series([
      (cb) => {
        lockClient = mysql.createConnection(config.connection);
        lockClient.connect(cb);
      },
      (cb) => {
        migrationClient = mysql.createConnection(_.merge({}, config.connection, { timezone: '+00:00', charset: 'utf8_general_ci', multipleStatements: true }));
        migrationClient.connect(cb);
      },
      (cb) => {
        userClient = mysql.createConnection(config.connection);
        debug('Connecting to %s', getLoggableUrl());
        userClient.connect(cb);
      },
    ], guard(cb));
  }

  function disconnect(cb) {
    debug('Disconnecting from %s', getLoggableUrl());
    async.series([
      lockClient.end.bind(lockClient),
      migrationClient.end.bind(migrationClient),
      userClient.end.bind(userClient),
    ], guard(cb));
  }

  function dropMigrations(cb) {
    migrationClient.query(SQL.dropMigrationsTables, guard(cb));
  }

  function ensureMigrations(cb) {
    async.series([
      migrationClient.query.bind(migrationClient, SQL.ensureMigrationsTables),
      migrationClient.query.bind(migrationClient, SQL.checkNamespaceColumn),
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
    migrationClient.query(SQL.retrieveMigrations, (err, result) => {
      if (err) return cb(err);
      cb(null, result);
    });
  }

  function runMigration(migration, cb) {
    _.defaults(migration, { directives: {} });

    checkDirectives(migration.directives);

    if (/^true$/i.test(migration.directives.skip)) {
      debug('Skipping migration %s: %s\n%s', migration.level, migration.comment, migration.script);
      return cb();
    }

    debug('Run migration %s: %s\n%s', migration.level, migration.comment, migration.script);
    userClient.query(migration.script, (err) => {
      if (err) return cb(decorate(err, migration));
      if (auditable(migration)) {
        return migrationClient.query(SQL.insertMigration, [
          migration.level,
          migration.directives.comment || migration.comment,
          migration.timestamp,
          migration.checksum,
          migration.namespace || 'default',
        ], (err) => {
          if (err) return cb(decorate(err, migration));
          cb();
        });
      }
      cb();
    });
  }

  function checkDirectives(directives) {
    const unsupportedDirectives = _.chain(directives).keys().difference(supportedDirectives).value();
    if (unsupportedDirectives.length === 0) return;
    if (!config.quiet) {
      logger.warn('Ignoring unsupported directives: %s. Try upgrading %s.', unsupportedDirectives, pkg.name);
    }
  }

  function auditable(migration) {
    if (Object.prototype.hasOwnProperty.call(migration, 'directives')) return !/^false$/i.test(migration.directives.audit);
    if (Object.prototype.hasOwnProperty.call(migration, 'audit')) {
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
    return _.merge(err, { migration });
  }

  function guard(cb) {
    return (err) => {
      cb(err);
    };
  }

  return {
    connect,
    disconnect,
    dropMigrations,
    ensureMigrations,
    lockMigrations,
    unlockMigrations,
    getMigrations,
    runMigration,
  };
};

function getMysql(config) {
  const mysql = config.mysql || optional('mysql2') || optional('mysql');
  if (!mysql) throw new Error('Please install mysql or mysql2');
  return mysql;
}

function optional(library) {
  debug('Require optional library: %s', library);
  let client;
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    client = require(library);
  } catch (err) {
    // OK
  }
  return client;
}
