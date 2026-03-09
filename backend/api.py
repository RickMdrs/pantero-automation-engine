import os
import sys
import json
import time
import sqlite3
import ctypes
import subprocess
import multiprocessing
import psutil
import requests
import uvicorn
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Internal modules
import historico
import telegram_auth
import conectar_contas
from keyauth import api as keyauth_api

# Load environment variables for security
load_dotenv()

# Workspace setup: Redirects engine to local app data for persistence
app_data_path = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA_Data")
if not os.path.exists(app_data_path):
    os.makedirs(app_data_path)
os.chdir(app_data_path)

app = FastAPI(title="Pantero IA Backend Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# KeyAuth Configuration from environment
keyauthapp = keyauth_api(
    name=os.getenv("KEYAUTH_NAME"),
    ownerid=os.getenv("KEYAUTH_OWNER_ID"),
    secret=os.getenv("KEYAUTH_SECRET"),
    version=os.getenv("KEYAUTH_VERSION"),
    hash_to_check=None
)

def init_db():
    """Initializes SQLite with WAL mode for high concurrency."""
    try:
        with sqlite3.connect('pantero_data.db', timeout=30) as conn:
            conn.execute('PRAGMA journal_mode=WAL;')
            conn.execute('PRAGMA synchronous=NORMAL;')
    except Exception as e:
        print(f"Database Init Warning: {e}")

init_db()

# --- Schemas ---
class Configuration(BaseModel):
    whatsapp_groups: List[str]
    license_key: str = ""
    ghost_mode: bool

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    full_name: str

# Global process management
bot_process = None

def get_system_hwid():
    """Retrieves unique hardware ID for licensing validation."""
    if os.name == 'nt':
        try:
            return subprocess.check_output('wmic csproduct get uuid', shell=True).decode().split('\n')[1].strip()
        except: return "HWID_FAIL_WIN"
    return "HWID_LINUX"

@app.post("/auth/login")
def user_login(data: LoginRequest):
    """Handles secure authentication flow via KeyAuth API."""
    keyauth_url = "https://keyauth.win/api/1.2/"
    
    # Session Initialization
    try:
        init_payload = {"type": "init", "ver": "1.0", "name": keyauthapp.name, "ownerid": keyauthapp.ownerid}
        init_res = requests.post(keyauth_url, data=init_payload, timeout=10).json()
        if not init_res.get("success"): 
            return {"success": False, "message": init_res.get('message', 'Init Error')}
        session_id = init_res.get("sessionid")
    except Exception as e: 
        return {"success": False, "message": f"Connection Error: {str(e)}"}

    # Secure Login Attempt
    try:
        login_payload = {
            "type": "login", 
            "username": data.username, 
            "pass": data.password, 
            "hwid": get_system_hwid(), 
            "sessionid": session_id, 
            "name": keyauthapp.name, 
            "ownerid": keyauthapp.ownerid
        }
        login_data = requests.post(keyauth_url, data=login_payload, timeout=10).json()
        
        if login_data.get("success"):
            user_info = login_data.get("info", {})
            subs = user_info.get("subscriptions", [])
            max_expiry = max([int(sub.get("expiry", 0)) for sub in subs]) if subs else 0
            now = int(time.time())
            days = max(0, int((max_expiry - now) / 86400))

            is_expired = bool(max_expiry > 0 and now > max_expiry)
            if is_expired:
                historico.salvar_log("error", "Access Denied: License Expired.")

            # Update local config with session data
            try:
                cfg = {}
                if os.path.exists('config.json'):
                    with open('config.json', 'r') as f: cfg = json.load(f)
                cfg.update({'current_user': data.username, 'expiry_timestamp': max_expiry})
                with open('config.json', 'w') as f: json.dump(cfg, f, indent=2)
            except: pass

            return {
                "success": True,
                "username": data.username,
                "days_left": days,
                "is_expired": is_expired
            }
        return {"success": False, "message": "Invalid credentials."}
    except Exception as e: 
        return {"success": False, "message": f"Internal Server Error: {str(e)}"}

# ... (restante do código mantido com a mesma lógica, apenas traduzindo logs)