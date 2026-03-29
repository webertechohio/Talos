from flask import Flask, jsonify, request, render_template, session, redirect, url_for
import ticket_manager
import os

app = Flask(__name__)
# Secure secret key for session cookies needed for authentication
app.secret_key = os.urandom(24)

# Hackathon mock database of allowed Employee Users
# In a real enterprise environment, this would integrate with Windows Active Directory/LDAP
AUTHORIZED_USERS = {
    "emp_jdoe": "hackathon123!",
    "emp_asmith": "securepass"
}

# --- END-USER WEB PORTAL ROUTES ---

@app.route('/', methods=['GET'])
def index():
    if 'user' in session:
        return redirect(url_for('support_portal'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Simple Authentication Constraint Engine
        if username in AUTHORIZED_USERS and AUTHORIZED_USERS[username] == password:
            session['user'] = username
            return redirect(url_for('support_portal'))
        else:
            return render_template('login.html', error="Invalid Employee Access Credentials")
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route('/support', methods=['GET', 'POST'])
def support_portal():
    if 'user' not in session:
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        
        # Prepend the username to track who opened the ticket from the Helpdesk App
        full_title = f"[{session['user']}] {title}"
        
        # Store in the SQLite Database natively
        ticket_manager.create_ticket(full_title, description, alert_id="USER-WEB-SUBMIT")
        return render_template('portal.html', success=f"Ticket successfully submitted! Your IT request has been forwarded to the Wazuh Security Dashboard.")
        
    return render_template('portal.html')


# --- REST API ROUTES (For Wazuh Dashboard Analysts) ---

@app.route('/tickets', methods=['GET'])
def get_all_tickets():
    """Fetch all security tickets."""
    tickets = ticket_manager.get_tickets()
    return jsonify({"data": tickets, "count": len(tickets)}), 200

@app.route('/tickets', methods=['POST'])
def create_new_ticket():
    """Create a new ticket from a Wazuh Dashboard action."""
    data = request.json
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
        
    result = ticket_manager.create_ticket(
        title=data.get('title'),
        description=data.get('description', ''),
        alert_id=data.get('alert_id')
    )
    return jsonify(result), 201

@app.route('/tickets/<int:ticket_id>/close', methods=['POST'])
def close_ticket(ticket_id):
    """Close an automated or manual security ticket."""
    result = ticket_manager.update_status(ticket_id, "Closed")
    return jsonify(result), 200

# --- KNOWLEDGE BASE & SCRIPT LIBRARY ROUTES ---

@app.route('/kb', methods=['GET'])
def get_all_kb_articles():
    """Fetch all IT Documentation Wiki articles."""
    kb = ticket_manager.get_kb_articles()
    return jsonify({"data": kb, "count": len(kb)}), 200

@app.route('/scripts', methods=['GET'])
def get_all_scripts():
    """Fetch the Master Automation Script library templates."""
    scripts = ticket_manager.get_scripts()
    return jsonify({"data": scripts, "count": len(scripts)}), 200

if __name__ == "__main__":
    # Ensure the standalone DB is created completely independent from the core Wazuh indexing logic
    ticket_manager.init_db()
    # Standardized Talos Ticketing Port for Dashboard Integration
    app.run(host='0.0.0.0', port=5001, debug=True)
