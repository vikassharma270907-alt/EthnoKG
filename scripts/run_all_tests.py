#!/usr/bin/env python3
"""
EthnoKG Master Quality Gate & Verification Runner
Executes:
1. Pytest Unit & Integration Test Suite (backend/tests)
2. 12 Pre-Deployment Production Readiness Checks (scripts/test_deployment_readiness.py)
3. Literature Extraction & NLP Gold-Standard Benchmark (scripts/run_evaluation.py)
"""

import sys
import subprocess
import os

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    # Set PYTHONPATH environment for sub-processes
    env = os.environ.copy()
    backend_dir = os.path.join(root_dir, "backend")
    env["PYTHONPATH"] = f"{root_dir}{os.pathsep}{backend_dir}"
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["PYTHONUNBUFFERED"] = "1"

    print("=" * 72)
    print("ETHNOKG PLATFORM - MASTER QUALITY GATE VERIFICATION SUITE")
    print("=" * 72)

    # Step 1: Pytest Suite
    print("\n[GATE 1/3] Executing Unit & Integration Tests via Pytest...")
    pytest_cmd = [sys.executable, "-m", "pytest", "backend/tests", "-v"]
    pytest_res = subprocess.run(pytest_cmd, env=env)
    if pytest_res.returncode != 0:
        print("\n❌ GATE 1 FAILED: Pytest test suite encountered failures.")
        return pytest_res.returncode
    print("✅ GATE 1 PASSED: All Pytest unit and integration tests passed.")

    # Step 2: Deployment Readiness
    print("\n[GATE 2/3] Executing 12 Pre-Deployment Production Readiness Checks...")
    readiness_script = os.path.join(root_dir, "scripts", "test_deployment_readiness.py")
    readiness_res = subprocess.run([sys.executable, readiness_script], env=env)
    if readiness_res.returncode != 0:
        print("\n❌ GATE 2 FAILED: Pre-deployment readiness verification failed.")
        return readiness_res.returncode
    print("✅ GATE 2 PASSED: All 12 deployment readiness checks validated.")

    # Step 3: Evaluation Benchmark
    print("\n[GATE 3/3] Executing EthnoKG Evaluation & Benchmark Suite...")
    eval_script = os.path.join(root_dir, "scripts", "run_evaluation.py")
    eval_res = subprocess.run([sys.executable, eval_script], env=env)
    if eval_res.returncode != 0:
        print("\n❌ GATE 3 FAILED: Evaluation benchmark failed.")
        return eval_res.returncode
    print("✅ GATE 3 PASSED: Evaluation benchmark passed successfully.")

    print("\n" + "=" * 72)
    print("🎉 ALL ETHNOKG QUALITY GATES PASSED WITH ZERO ERRORS!")
    print("=" * 72)
    return 0

if __name__ == "__main__":
    sys.exit(main())
