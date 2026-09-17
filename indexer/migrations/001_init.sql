-- Migration: 001_init.sql
-- Stellar Escrow Indexer Schema

-- 1. Track indexed ledger sequences and stream cursors
CREATE TABLE IF NOT EXISTS indexed_ledgers (
    sequence BIGINT PRIMARY KEY,
    cursor TEXT NOT NULL,
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Escrows table storing current on-chain state
CREATE TABLE IF NOT EXISTS escrows (
    id BIGINT PRIMARY KEY,
    client VARCHAR(64) NOT NULL,
    freelancer VARCHAR(64) NOT NULL,
    arbiter VARCHAR(64) NOT NULL,
    token VARCHAR(64) NOT NULL,
    amount NUMERIC(38, 0) NOT NULL,
    deadline BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrows_client ON escrows(client);
CREATE INDEX IF NOT EXISTS idx_escrows_freelancer ON escrows(freelancer);
CREATE INDEX IF NOT EXISTS idx_escrows_arbiter ON escrows(arbiter);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);

-- 3. Escrow lifecycle event history for auditable timeline
CREATE TABLE IF NOT EXISTS escrow_events (
    id SERIAL PRIMARY KEY,
    escrow_id BIGINT NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    ledger_sequence BIGINT NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_escrow_event UNIQUE (ledger_sequence, tx_hash, event_type, escrow_id)
);

CREATE INDEX IF NOT EXISTS idx_events_escrow_id ON escrow_events(escrow_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON escrow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_ledger ON escrow_events(ledger_sequence);
