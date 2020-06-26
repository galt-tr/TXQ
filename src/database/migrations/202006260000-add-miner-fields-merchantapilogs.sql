 ALTER TABLE merchantapilog ADD COLUMN miner varchar NULL;

-- Insert versions bootstrap
INSERT INTO versions(version) VALUES ('202006260000');


