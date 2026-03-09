import os
import traceback
import shutil
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

driver_config = None

# Absolute pathing for session synchronization
STATUS_FILE = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA_Dados", "status_conexoes.json")
MASTER_PROFILE_NAME = "perfil_master"

SERVICE_URLS = {
    "whatsapp": "https://web.whatsapp.com",
    "mercadolivre": "https://www.mercadolivre.com.br",
    "amazon": "https://www.amazon.com.br",
    "telegram": "https://web.telegram.org" 
}

def carregar_status():
    """Loads the current connection status for all services."""
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r') as f: return json.load(f)
        except Exception: pass
    return {}

def salvar_status_individual(servico, ativo):
    """Updates the status of a specific service in the local JSON storage."""
    data = carregar_status()
    data[servico] = ativo
    with open(STATUS_FILE, 'w') as f: json.dump(data, f, indent=2)

def abrir_navegador_especifico(servico):
    """
    Launches a Chrome instance for a specific service setup.
    Implements profile isolation to prevent session conflicts.
    """
    global driver_config
    fechar_navegador() 
    
    base_path = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA")
    profile_path = os.path.join(base_path, "connections", MASTER_PROFILE_NAME)
    driver_log = os.path.join(base_path, "chromedriver.log") 
    
    if not os.path.exists(os.path.join(base_path, "connections")):
        os.makedirs(os.path.join(base_path, "connections"))
    
    options = Options()
    options.add_argument(f"user-data-dir={profile_path}")
    options.add_argument("--start-maximized")
    
    # Stealth flags to bypass automated software detection
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        driver_bin = ChromeDriverManager().install()
        chrome_service = Service(driver_bin, log_path=driver_log)
        chrome_service.creation_flags = 0x08000000 # Suppress console window
        
        driver_config = webdriver.Chrome(service=chrome_service, options=options)
        target_url = SERVICE_URLS.get(servico)
        if target_url: driver_config.get(target_url)
        
        salvar_status_individual(servico, True)
        return {"status": "success", "mensagem": f"Authentication browser opened for {servico}"}
        
    except Exception as e:
        salvar_status_individual(servico, False)
        # Crash Reporting: Generates an error report on desktop for easier debugging
        try:
            error_report_path = os.path.join(os.path.expanduser("~"), "Desktop", "PANTERO_CRITICAL_ERROR.txt")
            with open(error_report_path, "w", encoding="utf-8") as f:
                f.write(f"CRITICAL ERROR DURING CHROME ORCHESTRATION ({servico}):\n\n")
                f.write(traceback.format_exc())
        except: pass
            
        return {"status": "error", "mensagem": str(e)}

def limpar_sessao_whatsapp():
    """Performs a deep cleanup of WhatsApp Web sessions using a headless browser."""
    print("Initializing WhatsApp session cleanup...")
    base_path = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA")
    profile_path = os.path.join(base_path, "connections", MASTER_PROFILE_NAME)
    
    options = Options()
    options.add_argument(f"user-data-dir={profile_path}")
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    
    try:
        chrome_service = Service(ChromeDriverManager().install())
        chrome_service.creation_flags = 0x08000000
        
        driver = webdriver.Chrome(service=chrome_service, options=options)
        driver.set_page_load_timeout(30)
        
        try:
            driver.get("https://web.whatsapp.com")
            time.sleep(2)
            # Purging all local and session storage
            driver.execute_script("window.localStorage.clear();")
            driver.execute_script("window.sessionStorage.clear();")
            driver.delete_all_cookies()
            print("WhatsApp session successfully purged.")
        except Exception as e:
            print(f"Cleanup failed: {e}")
        finally:
            driver.quit()
    except Exception as e:
        print(f"Failed to initialize cleanup driver: {e}")

def desconectar_servico(servico):
    """
    Master Kill-Switch: Terminates all active processes to unlock the user profile
    before performing a secure logout.
    """
    print(f"--- DISCONNECTING SERVICE: {servico.upper()} ---")
    
    salvar_status_individual(servico, False)
    
    # Process management: Forcefully terminating any locked instances
    if os.name == 'nt':
        os.system("taskkill /F /IM robo_pro.exe >nul 2>&1")
        os.system("taskkill /f /im chromedriver.exe >nul 2>&1")
        os.system("taskkill /f /im chrome.exe >nul 2>&1")
    
    time.sleep(1.5) # I/O Buffer for file unlocking
    fechar_navegador()
    
    if servico == "whatsapp":
        limpar_sessao_whatsapp()
    elif servico == "telegram":
        try:
            # Removing session artifacts to ensure a clean slate
            for f in ["sessao_pro.session", "sessao_pro.session-journal", "sessao_temp.session"]:
                if os.path.exists(f): os.remove(f)
        except: pass
    
    return True

def fechar_navegador():
    """Gracefully terminates the active configuration browser."""
    global driver_config
    if driver_config:
        try: driver_config.quit()
        except: pass
        driver_config = None