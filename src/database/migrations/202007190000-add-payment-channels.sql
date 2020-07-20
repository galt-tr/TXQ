CREATE TABLE paymentchannel (
    paymentchannelid varchar PRIMARY KEY,
    closed boolean NOT NULL,
    updated_at integer NOT NULL,
    created_at integer NOT NULL
);

CREATE TABLE paymentchannel_tx (
    id SERIAL PRIMARY KEY,
    txid varchar NOT NULL,
    rawtx text NULL,
    paymentchannelid varchar NOT NULL,
    updated_at integer NULL,
    created_at integer NOT NULL
);

CREATE INDEX idx_paymentchannel_tx_txid ON paymentchannel_tx USING btree (txid);
CREATE INDEX idx_paymentchannel_tx_paymentchannelid ON paymentchannel_tx USING btree (paymentchannelid);

-- Insert versions bootstrap
INSERT INTO versions(version) VALUES ('202007190000');


