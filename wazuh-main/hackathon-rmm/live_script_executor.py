#!/usr/bin/env python3
import json
import os
import sys
import subprocess
import base64

def main():
    try:
        # Wazuh Active Responses always feed the trigger data strictly via STDIN
        input_data = sys.stdin.read()
        if not input_data:
            sys.exit(1)
        
        # Parse the JSON payload sent by the Wazuh dashboard/API
        alert = json.loads(input_data)
        parameters = alert.get("parameters", {})
        
        # The raw bash/powershell script is passed in 'extra_args' array
        extra_args = parameters.get("extra_args", [])
        if not extra_args:
            sys.exit(0)
            
        # We enforce base64 encoding from the UI so special characters don't break JSON
        b64_script = extra_args[0]
        script_content = base64.b64decode(b64_script).decode('utf-8')
        
        # Execute differently based on Operating System of the endpoint
        if os.name == 'nt':
            # Windows: Run silently via PowerShell
            process = subprocess.Popen(["powershell", "-WindowStyle", "Hidden", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script_content], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        else:
            # Linux: Run silently via bash
            process = subprocess.Popen(["bash", "-c", script_content], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
        stdout, stderr = process.communicate()
        
        # Append the results natively into Wazuh's active response tracking log
        log_file = "/var/ossec/logs/active-responses.log"
        if os.name == 'nt':
            log_file = "C:\\Program Files (x86)\\ossec-agent\\active-response\\active-responses.log"
            
        # We format the log perfectly so it ingest back into OpenSearch as a new Security Alert if it errors
        with open(log_file, "a") as f:
            output_clean = stdout.decode().replace('\n', ' | ')
            error_clean = stderr.decode().replace('\n', ' | ')
            f.write(f"wazuh-rmm: Remote script execution completed. Output: [{output_clean}] Errors: [{error_clean}]\n")
            
        sys.exit(0)
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    main()
