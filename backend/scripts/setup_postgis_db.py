#!/usr/bin/env python3
"""
backend/scripts/setup_postgis_db.py
Sahay-AI — PostGIS Spatial Database Migration & Seed Script

Usage:
    python backend/scripts/setup_postgis_db.py
    python backend/scripts/setup_postgis_db.py --db-url "postgresql://postgres:password@localhost:5432/sahay_ai"
"""

import sys
import os
import argparse
from pathlib import Path

# Add backend directory to sys.path so we can import engine.spatial
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Read backend/.env if available
env_file = BACKEND_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = val


def main():
    parser = argparse.ArgumentParser(
        description="Initialize PostGIS extension, channel_partners schema, and seed branches for Sahay-AI."
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=os.environ.get("DATABASE_URL", "").strip(),
        help="PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/dbname)",
    )
    args = parser.parse_args()

    dsn = args.db_url
    if not dsn:
        print("=" * 70)
        print("❌ DATABASE_URL is not set!")
        print("=" * 70)
        print("You can supply it via:")
        print("  1. Setting DATABASE_URL in backend/.env:")
        print("     DATABASE_URL=postgresql://user:password@host:5432/sahay_ai")
        print("  2. Passing it as a CLI argument:")
        print("     python backend/scripts/setup_postgis_db.py --db-url \"postgresql://...\"")
        print("\nFree Instant PostGIS Cloud Options:")
        print("  - Neon.tech (Free Serverless Postgres with PostGIS extension included)")
        print("  - Supabase (Free Postgres with PostGIS extension included)")
        print("=" * 70)
        sys.exit(1)

    print("=" * 70)
    print("🛰️  SAHAY-AI: Initializing PostGIS Spatial Engine & Seed Data")
    print(f"Connecting to: {dsn.split('@')[-1] if '@' in dsn else dsn} ...")
    print("=" * 70)

    try:
        from engine.spatial import seed_postgis_database, route_application, check_db_status

        count = seed_postgis_database(dsn)
        print(f"✅ Success! Created PostGIS extension and seeded {count} channel partner branches.")

        print("\nTesting Spatial Distance Query (Patan Center: 21.0366, 81.5369)...")
        os.environ["DATABASE_URL"] = dsn
        res = route_application(21.0366, 81.5369, "MICRO_FINANCE", 90000.0)
        if res.allocated_partner:
            p = res.allocated_partner
            print(f"  → Nearest Partner: {p.branch_name}")
            print(f"  → Distance: {p.distance_km} km | IFSC: {p.ifsc_code} | Quota: ₹{p.fund_quota_remaining:,.0f}")
            print(f"  → Engine Mode: {res.engine_mode.upper()} via ST_Distance(location::geography)")

        print("\nTesting Spatial Distance Query (Dhamdha Center: 21.4468, 81.3142)...")
        res2 = route_application(21.4468, 81.3142, "MICRO_FINANCE", 90000.0)
        if res2.allocated_partner:
            p2 = res2.allocated_partner
            print(f"  → Nearest Partner: {p2.branch_name}")
            print(f"  → Distance: {p2.distance_km} km | IFSC: {p2.ifsc_code} | Quota: ₹{p2.fund_quota_remaining:,.0f}")

        status = check_db_status()
        print("\nDatabase Status Endpoint Summary:")
        print(f"  - Engine: {status.get('engine')}")
        print(f"  - PostGIS Active: {status.get('postgis_active')}")
        print(f"  - Branch Count: {status.get('branch_count')}")
        print("=" * 70)
        print("🎉 PostGIS database setup is complete and ready for live production routing!")

    except Exception as e:
        print(f"\n❌ Error configuring PostGIS database: {e}")
        print("Hint: Make sure the database exists and the user has permissions to CREATE EXTENSION.")
        sys.exit(1)


if __name__ == "__main__":
    main()

