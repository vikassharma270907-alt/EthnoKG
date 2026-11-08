import urllib.request
import json
import time
import sys

base = "https://ethnokg-platform.onrender.com"
tests = [
    ("/healthz", "GET", 200),
    ("/api/info", "GET", 200),
    ("/api/graph/cache/stats", "GET", 200),
    ("/api/analytics/discovery-index", "GET", 200),
    ("/api/analytics/convergence", "GET", 200),
    ("/api/analytics/sovereignty-certificate/1", "GET", 200),
    ("/walkthrough/EthnoKG_Complete_Project_Walkthrough.mp4", "HEAD", 200)
]

print(f"PROBING LIVE PRODUCTION: {base}")
all_ok = True
for ep, method, expected in tests:
    url = base + ep
    t0 = time.time()
    try:
        req = urllib.request.Request(url, method=method, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as res:
            elapsed = round((time.time() - t0) * 1000, 1)
            status = res.status
            ok = status == expected
            all_ok = all_ok and ok
            print(f"[{method}] {ep:<55} -> HTTP {status} ({elapsed}ms) [PASSED]")
    except Exception as e:
        all_ok = False
        print(f"[{method}] {ep:<55} -> FAILED: {e}")

if all_ok:
    print("\nPROD VERIFICATION RESULT: 100% HEALTHY - ALL ENDPOINTS PASSING")
    sys.exit(0)
else:
    print("\nPROD VERIFICATION RESULT: FAILURES DETECTED")
    sys.exit(1)
