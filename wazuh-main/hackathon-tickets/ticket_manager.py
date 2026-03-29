import sqlite3
import json
import os
from datetime import datetime

# Initialize the standalone Ticketing DB in the Wazuh data directory
DB_PATH = "/var/ossec/var/db/tickets.db"
# Fallback for Windows local testing
if os.name == 'nt':
    DB_PATH = "C:\\wazuh-tickets.db"

def init_db():
    """Create the massive ecosystem schema if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Tickets Table (Updated with kb_id linking column)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'Open',
            alert_id TEXT,
            kb_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. Incident Knowledge Base (KB) Articles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS kb_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 3. Master Scripting Templates Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS script_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            payload TEXT NOT NULL,
            platform TEXT
        )
    ''')
    
    # Pre-populate Dummy Scripts if empty (so the GUI demo works immediately)
    cursor.execute('SELECT COUNT(*) FROM script_templates')
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO script_templates (name, description, payload, platform) VALUES (?, ?, ?, ?)", 
            ("Isolate Host Network", "Disconnects the endpoint from all networks except Wazuh Manager.", "netsh advfirewall set allprofiles state on\nnetsh advfirewall firewall add rule name=\"BlockAll\" dir=in action=block", "Windows"))
        cursor.execute("INSERT INTO script_templates (name, description, payload, platform) VALUES (?, ?, ?, ?)", 
            ("Deploy MeshCentral RMM", "Silently downloads and installs MeshCentral agent.", "Invoke-WebRequest -Uri 'http://my-rmm/agent.exe' -OutFile 'C:\\Windows\\Temp\\rmm.exe'\nStart-Process -FilePath 'C:\\Windows\\Temp\\rmm.exe' -ArgumentList '-install' -Wait", "Windows"))
        cursor.execute("INSERT INTO script_templates (name, description, payload, platform) VALUES (?, ?, ?, ?)", 
            ("Kill Malicious Sysadmin", "Kills the specific bad actor's active PowerShell session.", "Stop-Process -Name 'powershell' -Force", "Windows/Linux"))

    # Pre-populate Dummy KB Article
    cursor.execute('SELECT COUNT(*) FROM kb_articles')
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO kb_articles (title, content, category) VALUES (?, ?, ?)", 
            ("Malware Remediation Playbook", "1. Isolate the Host using the Automator script.\n2. Run a full Yeti hunt.\n3. Image the drive.", "Incident Response"))

    conn.commit()
    conn.close()

# --- TICKETING Functions ---
def create_ticket(title, description, alert_id=None, kb_id=None):
    """Insert a new ticket linked to an optional Wazuh Alert ID and Wiki KB ID."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tickets (title, description, alert_id, kb_id)
        VALUES (?, ?, ?, ?)
    ''', (title, description, alert_id, kb_id))
    conn.commit()
    ticket_id = cursor.lastrowid
    conn.close()
    return {"ticket_id": ticket_id, "status": "created", "title": title}

def get_tickets():
    """Retrieve all tickets from the database, alongside any Linked KB Articles."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    # Perform a SQL JOIN so the React Dashboard instantly gets the joined Wiki data!
    cursor.execute('''
        SELECT t.*, k.title as kb_title 
        FROM tickets t 
        LEFT JOIN kb_articles k ON t.kb_id = k.id 
        ORDER BY t.created_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_status(ticket_id, new_status):
    """Update a ticket's status."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE tickets SET status = ? WHERE id = ?', (new_status, ticket_id))
    conn.commit()
    conn.close()
    return {"ticket_id": ticket_id, "status": new_status}

# --- KNOWLEDGE BASE Functions ---
def create_kb_article(title, content, category):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO kb_articles (title, content, category) VALUES (?, ?, ?)', (title, content, category))
    conn.commit()
    kb_id = cursor.lastrowid
    conn.close()
    return {"kb_id": kb_id, "status": "created"}

def get_kb_articles():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM kb_articles ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# --- SCRIPT MANAGER Functions ---
def get_scripts():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM script_templates')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    init_db()
    print(f"Hackathon Expanded Ecosystem Database successfully initialized at: {DB_PATH}")
