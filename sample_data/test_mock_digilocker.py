import sys
import asyncio

sys.path.insert(0, 'backend')
from routers.schemes import (
    get_digilocker_status,
    get_digilocker_personas,
    verify_and_sync_digilocker,
    DigiLockerTokenRequest,
)

async def main():
    status = await get_digilocker_status()
    print("1. Status:", status)

    personas = await get_digilocker_personas()
    print("2. Personas count:", len(personas.get("personas", [])))

    for pid in ["sunita_sahu", "priya_sharma", "ramesh_kumar"]:
        res = await verify_and_sync_digilocker(DigiLockerTokenRequest(persona_id=pid))
        print(f"3. {pid} synced:", res["user"]["name"], "| Verified:", res["verified_documents"])

if __name__ == "__main__":
    asyncio.run(main())

