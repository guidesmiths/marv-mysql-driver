ALTER TABLE migrations ADD COLUMN namespace VARCHAR(255) DEFAULT 'default';
ALTER TABLE migrations DROP PRIMARY KEY, ADD PRIMARY KEY (level, namespace);
