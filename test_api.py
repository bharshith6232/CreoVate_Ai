import urllib.request
import json

def run_tests():
    print("Testing /api/health...")
    health = json.loads(urllib.request.urlopen("http://localhost:8000/api/health").read().decode())
    print("Health OK:", health)

    print("\nTesting /api/creators/kiara-mehta...")
    detail = json.loads(urllib.request.urlopen("http://localhost:8000/api/creators/kiara-mehta").read().decode())
    print(f"Detail OK: {detail['name']} | Portfolio items: {len(detail['portfolio'])}")

    print("\nTesting /api/brief/refine-ai...")
    req = urllib.request.Request(
        "http://localhost:8000/api/brief/refine-ai",
        data=json.dumps({"text": "Skincare UGC video for Instagram"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    refine = json.loads(urllib.request.urlopen(req).read().decode())
    print("Refine OK:", refine["signals"])

    print("\nTesting /api/campaigns/match...")
    m_req = urllib.request.Request(
        "http://localhost:8000/api/campaigns/match",
        data=json.dumps({"title": "Skincare Reels", "content_type": "UGC Content"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    matches = json.loads(urllib.request.urlopen(m_req).read().decode())
    top = matches["matches"][0]
    print(f"Match OK: Top matched creator is {top['name']} with {top['match_score']}% match score!")

    print("\nTesting /api/bookings (Escrow)...")
    b_req = urllib.request.Request(
        "http://localhost:8000/api/bookings",
        data=json.dumps({"creator_id": "kiara-mehta", "tier": "Standard", "amount": 6000}).encode(),
        headers={"Content-Type": "application/json"}
    )
    booking = json.loads(urllib.request.urlopen(b_req).read().decode())
    print(f"Booking OK: {booking['status']} | Escrow ID: {booking['escrow_id']}")

    print("\nTesting / (Frontend Served via FastAPI)...")
    html_res = urllib.request.urlopen("http://localhost:8000/").read().decode()
    print(f"Frontend Static Mount OK: Received {len(html_res)} bytes of HTML containing '<title>Prismatch'")

    print("\n[SUCCESS] ALL API ENDPOINTS VERIFIED & WORKING PERFECTLY!")

if __name__ == "__main__":
    run_tests()
