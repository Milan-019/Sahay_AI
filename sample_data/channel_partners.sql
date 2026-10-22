-- ============================================================================
-- Sahay-AI — Channel Partner Spatial Router (PostGIS)
-- Seed Data & Schema Definition: Chhattisgarh Pilot Corridor (Durg & Raipur)
-- ============================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Channel Partners Table
DROP TABLE IF EXISTS channel_partners;
CREATE TABLE channel_partners (
    id                   SERIAL PRIMARY KEY,
    branch_name          TEXT NOT NULL,
    institution_name     TEXT NOT NULL,
    institution_type     TEXT NOT NULL CHECK (institution_type IN ('SCA', 'PSB', 'RRB', 'NBFC_MFI')),
    ifsc_code            TEXT,
    district             TEXT NOT NULL,
    block                TEXT NOT NULL,
    location             GEOGRAPHY(POINT, 4326) NOT NULL,
    serves_scheme_codes  TEXT[] NOT NULL,
    fund_quota_remaining NUMERIC NOT NULL DEFAULT 0,
    is_solvent           BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Spatial Index (GIST) for rapid nearest-neighbor search
CREATE INDEX IF NOT EXISTS idx_channel_partners_location
    ON channel_partners USING GIST (location);

-- 4. Seed Pilot Corridor Channel Partner Branches
INSERT INTO channel_partners 
    (id, branch_name, institution_name, institution_type, ifsc_code, district, block, location, serves_scheme_codes, fund_quota_remaining, is_solvent)
VALUES
    -- --- DURG DISTRICT ---
    (1, 'SBI Patan Branch', 'State Bank of India', 'PSB', 'SBIN0010836', 'Durg', 'Patan', 
     ST_SetSRID(ST_MakePoint(81.5369, 21.0366), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'TERM_LOAN', 'PMMY_MAHILA_UDYAMI', 'STAND_UP_INDIA_WOMEN'], 
     1800000.0, TRUE),

    (2, 'CRGB Patan Branch', 'Chhattisgarh Rajya Gramin Bank', 'RRB', 'CRGB0008162', 'Durg', 'Patan', 
     ST_SetSRID(ST_MakePoint(81.5398, 21.0392), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'PMMY_MAHILA_UDYAMI', 'NSFDC_MAHILA_SAMRIDHI'], 
     650000.0, TRUE),

    (3, 'SBI Dhamdha Branch', 'State Bank of India', 'PSB', 'SBIN0010835', 'Durg', 'Dhamdha', 
     ST_SetSRID(ST_MakePoint(81.3142, 21.4468), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'TERM_LOAN', 'PMMY_MAHILA_UDYAMI', 'STAND_UP_INDIA_WOMEN'], 
     0.0, TRUE), -- Quota exhausted: proves dynamic allocation bypass logic

    (4, 'CRGB Dhamdha Branch', 'Chhattisgarh Rajya Gramin Bank', 'RRB', 'CRGB0008111', 'Durg', 'Dhamdha', 
     ST_SetSRID(ST_MakePoint(81.3115, 21.4421), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'PMMY_MAHILA_UDYAMI', 'NSFDC_MAHILA_SAMRIDHI'], 
     850000.0, TRUE),

    (5, 'Durg District Antyavasayi Co-op Society', 'Chhattisgarh State Channelizing Agency (SCA)', 'SCA', NULL, 'Durg', 'Durg', 
     ST_SetSRID(ST_MakePoint(81.2849, 21.1904), 4326)::geography, 
     ARRAY['NSFDC_MAHILA_SAMRIDHI', 'MICRO_FINANCE', 'TERM_LOAN'], 
     3500000.0, TRUE),

    (6, 'PNB Sector 1 Bhilai', 'Punjab National Bank', 'PSB', 'PUNB0005700', 'Durg', 'Durg', 
     ST_SetSRID(ST_MakePoint(81.3812, 21.2140), 4326)::geography, 
     ARRAY['TERM_LOAN', 'STAND_UP_INDIA_WOMEN', 'PMMY_MAHILA_UDYAMI'], 
     4000000.0, FALSE), -- Insolvent/NPA flag: proves solvency compliance bypass

    -- --- RAIPUR DISTRICT ---
    (7, 'SBI Arang Branch', 'State Bank of India', 'PSB', 'SBIN0010828', 'Raipur', 'Arang', 
     ST_SetSRID(ST_MakePoint(81.9664, 21.1965), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'TERM_LOAN', 'PMMY_MAHILA_UDYAMI', 'STAND_UP_INDIA_WOMEN'], 
     1600000.0, TRUE),

    (8, 'CRGB Arang Branch', 'Chhattisgarh Rajya Gramin Bank', 'RRB', 'CRGB0008204', 'Raipur', 'Arang', 
     ST_SetSRID(ST_MakePoint(81.9642, 21.1980), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'PMMY_MAHILA_UDYAMI', 'NSFDC_MAHILA_SAMRIDHI'], 
     700000.0, TRUE),

    (9, 'SBI Abhanpur Branch', 'State Bank of India', 'PSB', 'SBIN0010827', 'Raipur', 'Abhanpur', 
     ST_SetSRID(ST_MakePoint(81.7485, 21.0543), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'TERM_LOAN', 'STAND_UP_INDIA_WOMEN', 'PMMY_MAHILA_UDYAMI'], 
     2200000.0, TRUE),

    (10, 'CRGB Telibandha Branch', 'Chhattisgarh Rajya Gramin Bank', 'RRB', 'CRGB0000142', 'Raipur', 'Dharsiwa', 
     ST_SetSRID(ST_MakePoint(81.6890, 21.2330), 4326)::geography, 
     ARRAY['MICRO_FINANCE', 'PMMY_MAHILA_UDYAMI', 'NSFDC_MAHILA_SAMRIDHI'], 
     1100000.0, TRUE),

    (11, 'Raipur District Antyavasayi Co-op Society', 'Chhattisgarh State Channelizing Agency (SCA)', 'SCA', NULL, 'Raipur', 'Dharsiwa', 
     ST_SetSRID(ST_MakePoint(81.6296, 21.2514), 4326)::geography, 
     ARRAY['NSFDC_MAHILA_SAMRIDHI', 'MICRO_FINANCE', 'TERM_LOAN'], 
     5000000.0, TRUE);

-- Reset sequence to max id
SELECT setval('channel_partners_id_seq', (SELECT MAX(id) FROM channel_partners));
