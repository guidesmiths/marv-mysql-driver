CREATE TABLE IF NOT EXISTS migrations (
    level INTEGER,
    comment TEXT,
    `timestamp` DATETIME,
    checksum TEXT,
    namespace VARCHAR(255) DEFAULT 'default',
    PRIMARY KEY (level, namespace)
);

CREATE TABLE IF NOT EXISTS migrations_lock (
    empty_table BOOLEAN
);
