#!/usr/bin/env python3
import sys
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.request
import urllib.parse

# ==============================================================================
# TWILIO API Configuration (For instant SMS texts to Security Analysts)
# ==============================================================================
TWILIO_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_TOKEN = "your_auth_token_here_from_twilio_dashboard"
TWILIO_FROM = "+1234567890"  # Your Twilio Virtual Phone Number
ADMIN_PHONE = "+1987654321"  # Your Cell Phone Number

# ==============================================================================
# SMTP Configuration (For Rich HTML Emails with IT Playbooks)
# ==============================================================================
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "talos.alert@mycompany.com"
SMTP_PASS = "app_password_here"
ADMIN_EMAIL = "security.admin@mycompany.com"

def send_sms(body):
    """Fires a highly formatted SMS string directly via the Twilio HTTP API constraint-free."""
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json"
    data = urllib.parse.urlencode({'To': ADMIN_PHONE, 'From': TWILIO_FROM, 'Body': body}).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    
    # HTTP Basic Auth natively inside Python for Twilio integration
    import base64
    auth_b64 = base64.b64encode(f"{TWILIO_SID}:{TWILIO_TOKEN}".encode('utf-8')).decode('utf-8')
    req.add_header('Authorization', f'Basic {auth_b64}')
    
    try:
        with urllib.request.urlopen(req) as response:
            # We don't print output typically in Wazuh Integrator scripts, it logs to ossec.log internally
            pass
    except Exception as e:
        # Fails silently to prevent locking the Wazuh Event Engine
        pass

def send_email(subject, html_body):
    """Fires a visually gorgeous HTML email via standard Unix SMTP libraries."""
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = ADMIN_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, ADMIN_EMAIL, msg.as_string())
        server.quit()
    except Exception:
        pass

def main():
    # Wazuh natively passes the specific generated Alert JSON File Object identically as the first argument
    if len(sys.argv) < 2:
        sys.exit(1)
        
    alert_file = sys.argv[1]
    with open(alert_file, 'r') as f:
        alert = json.load(f)

    # Parse the Wazuh Alert JSON structure mapping exactly to MITRE parameters
    rule_id = alert.get("rule", {}).get("id", "Unknown")
    level = alert.get("rule", {}).get("level", 0)
    description = alert.get("rule", {}).get("description", "No Description")
    agent_name = alert.get("agent", {}).get("name", "Wazuh-Manager")
    timestamp = alert.get("timestamp", "Unknown")
    full_log = alert.get("full_log", "")

    # 1. Execute SMS Architecture
    # Extremely concise for phone locks-screens
    sms_text = f"🔥 TALOS ALERT\nLevel {level} on {agent_name}\nDesc: {description}\nRule: {rule_id}"
    send_sms(sms_text)

    # 2. Execute HTML Email Architecture
    email_subject = f"[CyberCNS/Talos | Level {level}] Critical Security Event on {agent_name} - {description}"
    email_html = f"""
    <html>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #1a1b26; padding: 20px;">
        <div style="background-color: #24283b; padding: 30px; border-radius: 8px; border-left: 8px solid #f7768e; color: #a9b1d6;">
            <h2 style="color: #f7768e; margin-top: 5px;">🔥 CRITICAL TALOS SECURITY INCIDENT</h2>
            <p><strong>Impacted Endpoint:</strong> {agent_name}</p>
            <p><strong>Severity Filter Level:</strong> <span style="background-color: #f7768e; color: #1a1b26; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{level}</span></p>
            <p><strong>Rule Triggered:</strong> {rule_id} - {description}</p>
            <p><strong>Event Timestamp:</strong> {timestamp}</p>
            <hr style="border: 1px solid #414868;">
            <h3 style="color: #7aa2f7;">Intercepted Raw Data Stream:</h3>
            <pre style="background-color: #1a1b26; color: #9ece6a; padding: 15px; border-radius: 5px; overflow-x: auto;">{full_log}</pre>
            <hr style="border: 1px solid #414868;">
            <h3 style="color: #bb9af7;">Immediate Resolution Required:</h3>
            <p>Please log into the <b>React Auditing Dashboard</b>. You can isolate this endpoint immediately utilizing the Automated Master Script (<b>Rule ID: {rule_id}</b>).</p>
        </div>
      </body>
    </html>
    """
    send_email(email_subject, email_html)

if __name__ == "__main__":
    main()
