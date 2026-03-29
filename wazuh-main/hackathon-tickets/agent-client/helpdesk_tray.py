import pystray
from PIL import Image, ImageDraw
import webbrowser

# =========================================================
# CONFIGURATION
# During the Hackathon demo, change this to your EC2 IP Address
SERVER_IP = "192.168.1.100" 
SERVER_PORT = "55001"
SUPPORT_URL = f"http://{SERVER_IP}:{SERVER_PORT}/login"
# =========================================================

def create_image():
    """Generate a high-res blue icon with a white cross for the System Tray."""
    image = Image.new('RGB', (64, 64), color = (0, 86, 179))
    dc = ImageDraw.Draw(image)
    # Draw horizontal bar
    dc.rectangle((16, 28, 48, 36), fill=(255, 255, 255))
    # Draw vertical bar
    dc.rectangle((28, 16, 36, 48), fill=(255, 255, 255))
    return image

def on_menu_clicked(icon, item):
    """Handle the user's interaction with the tray icon."""
    if str(item) == "Open IT Support Portal":
        # Automatically launches the user's default browser directly to the Wazuh Flask Portal IP
        webbrowser.open(SUPPORT_URL)
    elif str(item) == "Exit Helpdesk App":
        # Unloads the agent from the system tray
        icon.stop()

def run_tray_agent():
    """Boots up the system tray application."""
    # Define the menu options that show up when you right click the icon
    menu = (
        pystray.MenuItem('Open IT Support Portal', on_menu_clicked, default=True),
        pystray.MenuItem('Exit Helpdesk App', on_menu_clicked)
    )
    
    icon = pystray.Icon("Wazuh IT Helpdesk", create_image(), "Employee Ticketing Server", menu)
    
    # icon.run() blocks the thread and keeps the app alive silently in the background
    icon.run()

if __name__ == "__main__":
    # In an enterprise environment, this script is deployed via GPO/RMM to run silently on startup.
    print(f"Starting IT Helpdesk tray agent hooked to -> {SUPPORT_URL}")
    run_tray_agent()
