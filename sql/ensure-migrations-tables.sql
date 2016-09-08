CREATE TABLE IF NOT EXISTS migrations (
    level INTEGER PRIMARY KEY,
    comment TEXT,
    `timestamp` DATETIME(3),
    checksum TEXT
);

CREATE TABLE IF NOT EXISTS migrations_lock (
    empty_table BOOLEAN
);
