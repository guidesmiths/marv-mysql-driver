var Hath = require('hath')
var marv = require('marv')
var path = require('path')
var mysql = require('mysql')
require('hath-assert')(Hath)

function shouldRunMigration(t, done) {
    const client = mysql.createConnection(t.locals.config.connection)
    client.connect(function(err) {
        if (err) throw err
        client.query('DROP TABLE IF EXISTS mysql_migrations; DROP TABLE IF EXISTS foo; DROP TABLE IF EXISTS bar;', function(err) {
            if (err) throw err
            marv.scan(path.join(__dirname, 'migrations'), function(err, migrations) {
                if (err) throw err
                marv.migrate(migrations, t.locals.driver, function(err) {
                    if (err) throw err
                    client.query('SELECT * FROM foo', function(err, result) {
                        if (err) throw err
                        t.assertEquals(result.length, 1)
                        t.assertEquals(result[0].id, 1)
                        t.assertEquals(result[0].value, 'foo')

                        client.query('SELECT * FROM bar', function(err, result) {
                            if (err) throw err
                            t.assertEquals(result.length, 1)
                            t.assertEquals(result[0].id, 1)
                            t.assertEquals(result[0].value, 'bar')
                            client.end()
                            done()
                        })
                    })
                })
            })
        })
    })
}

module.exports = Hath.suite('Driver Tests', [
    shouldRunMigration
])
