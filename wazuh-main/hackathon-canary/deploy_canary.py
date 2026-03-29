#!/usr/bin/env python3
import json
import os
import sys

# Wazuh Active Response payload is passed via STDIN
# This script creates a decoy "canary" file on the endpoint.
def main():
    try:
        # Read the alert payload from standard input (Wazuh format)
        input_data = sys.stdin.read()
        if input_data:
            alert = json.loads(input_data)
        
        # Define the location for the decoy file
        canary_dir = "/opt/wazuh-canary"
        if os.name == 'nt':
            # Support for testing on Windows
            canary_dir = "C:\\wazuh-canary"

        if not os.path.exists(canary_dir):
            os.makedirs(canary_dir)
            
        canary_file = os.path.join(canary_dir, "passwords.txt")
        
        # Write the decoy payload
        with open(canary_file, "w") as f:
            f.write("admin: p@ssw0rd123\n")
            f.write("root: r00t$ecr3t\n")
            f.write("backup: b@ckup90\n")
            
        # Wazuh requires a 0 exit code on success
        sys.exit(0)
    except Exception as e:
        # Silently fail for Active Responses, or log to a specific file
        sys.exit(1)

if __name__ == "__main__":
    main()
