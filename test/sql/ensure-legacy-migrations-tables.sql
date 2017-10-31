CREATE TABLE IF NOT EXISTS migrations (
    level INTEGER PRIMARY KEY,
    comment TEXT,
    `timestamp` DATETIME,
    checksum TEXT
);

