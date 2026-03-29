import time
import json
import urllib.request
import urllib.error
import os

# The destination file the React Dashboard will read via our API
ENRICHED_DB_PATH = "/var/ossec/var/db/cve_epss_enriched.json"
# Local fallback for development testing on Windows
if os.name == 'nt':
    ENRICHED_DB_PATH = "C:\\wazuh-cve-enriched.json"

def fetch_epss_score(cve_id):
    """Hits the official FIRST API to get the live EPSS exploit probability."""
    url = f"https://api.first.org/data/v1/epss?cve={cve_id}"
    try:
        # User-Agent is required by some public APIs
        req = urllib.request.Request(url, headers={'User-Agent': 'Wazuh-Hackathon-Integration'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data and "data" in data and len(data["data"]) > 0:
                # Returns raw EPSS score (e.g., 0.85 means 85% chance of exploit)
                return float(data["data"][0].get("epss", 0.0))
    except Exception as e:
        print(f"Error fetching EPSS for {cve_id}: {e}")
    return 0.0

def get_raw_wazuh_vulnerabilities():
    """Mock query against the local Wazuh OpenSearch cluster to pull active CVEs."""
    # During the hackathon demo, we don't have real infected agents yet, so we mock the feed
    return [
        {"agent": "Windows-Server-01", "cve": "CVE-2023-23397", "package": "Microsoft Outlook", "cvss_base": 9.8},
        {"agent": "Ubuntu-WEB-02",   "cve": "CVE-2021-44228", "package": "log4j-core", "cvss_base": 10.0},
        {"agent": "Windows-DB-01",   "cve": "CVE-2022-30190", "package": "Follina/MSDT", "cvss_base": 7.8},
        {"agent": "MacOS-Endpoint",  "cve": "CVE-2024-12345", "package": "fakesoftware", "cvss_base": 4.5},
    ]

def enrich_and_store():
    """Runs the full CyberCNS-style scoring cycle."""
    print("Starting Background EPSS Vulnerability Enrichment Cycle...")
    raw_vulns = get_raw_wazuh_vulnerabilities()
    enriched_data = []
    
    for vuln in raw_vulns:
        # Make the dynamic call to the exploit database
        epss_score = fetch_epss_score(vuln['cve'])
        vuln['epss_score'] = epss_score
        
        # ---------------------------------------------------------------------------------
        # The Secret Sauce: CyberCNS Priority Matrix Algorithm
        # CVSS (What is the base damage?) + EPSS (What is the true probability of attack?)
        vuln['action_priority'] = "Review Later"
        
        if vuln['cvss_base'] >= 8.0 and epss_score > 0.50:
            vuln['action_priority'] = "EMERGENCY: Immediate Remediation"
        elif vuln['cvss_base'] >= 7.0 and epss_score > 0.10:
            vuln['action_priority'] = "High Priority Patch"
        elif vuln['cvss_base'] >= 9.0 and epss_score < 0.01:
            vuln['action_priority'] = "High CVSS but NO known wild exploits (Monitor)"
        # ---------------------------------------------------------------------------------
            
        enriched_data.append(vuln)
        
    # Flush to the SQLite or JSON cache
    with open(ENRICHED_DB_PATH, 'w') as f:
        json.dump(enriched_data, f, indent=4)
        
    print(f"Enrichment Cycle Complete. Cached {len(enriched_data)} advanced CVEs to {ENRICHED_DB_PATH}")

if __name__ == "__main__":
    # In a production environment, this is scheduled as a CRON or native Wazuh Daemon task
    enrich_and_store()
