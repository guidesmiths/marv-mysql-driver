[![Build Status](https://img.shields.io/travis/guidesmiths/marv-mysql-driver/master.svg)](https://travis-ci.org/guidesmiths/marv-mysql-driver)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)

# marv-mysql-driver
A mysql driver for [marv](https://www.npmjs.com/package/marv)

## Usage
```
migrations/
  |- 001.create-table.sql
  |- 002.create-another-table.sql
```

```js
const marv = require('marv')
const mysqlDriver = require('marv-mysql-driver')
const directory = path.join(process.cwd(), 'migrations' )
const driver = mysqlDriver({
    table: 'db_migrations',     // defaults to 'migrations'
    connection: {               // the connection sub document is passed directly to mysql.createConnection
        host: 'localhost',
        port: 3306,
        database: 'example',
        user: 'me',
        password: 'secret',
        multipleStatements: true    // See https://www.npmjs.com/package/mysql#multiple-statement-queries
    }
})
marv.scan(directory, (err, migrations) => {
    if (err) throw err
    marv.migrate(migrations, driver, (err) => {
        if (err) throw err
    })
})
```

## Testing
```bash
npm install # or yarn
npm run docker
npm test
```

