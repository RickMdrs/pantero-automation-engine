import os
import traceback
import shutil
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import json

driver_config = None

ARQUIVO_STATUS = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA_Dados", "status_conexoes.json")
NOME_PERFIL_MASTER = "perfil_master"

URLS = {
    "whatsapp": "https://web.whatsapp.com",
    "mercadolivre": "https://www.mercadolivre.com.br",
    "amazon": "https://www.amazon.com.br",
    "telegram": "https://web.telegram.org" 
}

def carregar_status():
    if os.path.exists(ARQUIVO_STATUS):
        try:
            with open(ARQUIVO_STATUS, 'r') as f: return json.load(f)
        except: pass
    return {}

def salvar_status_individual(servico, ativo):
    dados = carregar_status()
    dados[servico] = ativo
    with open(ARQUIVO_STATUS, 'w') as f: json.dump(dados, f, indent=2)

def abrir_navegador_especifico(servico):
    global driver_config
    fechar_navegador() 
    
    caminho_base = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA")
    caminho_perfil = os.path.join(caminho_base, "conexoes", NOME_PERFIL_MASTER)
   
    caminho_log_driver = os.path.join(caminho_base, "chromedriver.log") 
    
    if not os.path.exists(os.path.join(caminho_base, "conexoes")):
        os.makedirs(os.path.join(caminho_base, "conexoes"))
    
    options = Options()
    options.add_argument(f"user-data-dir={caminho_perfil}")
    options.add_argument("--start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        caminho_driver = ChromeDriverManager().install()
        servico_chrome = Service(caminho_driver, log_path=caminho_log_driver)
        servico_chrome.creation_flags = 0x08000000 
        
        driver_config = webdriver.Chrome(service=servico_chrome, options=options)
        url_alvo = URLS.get(servico)
        if url_alvo: driver_config.get(url_alvo)
        
        salvar_status_individual(servico, True)
        return {"status": "success", "mensagem": f"Abrindo para {servico}"}
        
    except Exception as e:
        salvar_status_individual(servico, False)
      
        try:
            caminho_erro = os.path.join(os.path.expanduser("~"), "Desktop", "ERRO_PANTERO.txt")
            with open(caminho_erro, "w", encoding="utf-8") as f:
                f.write(f"ERRO CRÍTICO AO ABRIR O CHROME ({servico}):\n\n")
                f.write(traceback.format_exc())
        except: 
            pass
            
        return {"status": "error", "mensagem": str(e)}

def limpar_sessao_whatsapp():
    print("Iniciando limpeza do WhatsApp...")
    caminho_base = os.path.join(os.getenv('LOCALAPPDATA'), "PanteroIA")
    caminho_perfil = os.path.join(caminho_base, "conexoes", NOME_PERFIL_MASTER)
    caminho_log = os.path.join(caminho_base, "chromedriver_limpeza.log")
    
    options = Options()
    options.add_argument(f"user-data-dir={caminho_perfil}")
    options.add_argument("--headless=new") # Modo Invisível
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    try:
    
        servico_chrome = Service(ChromeDriverManager().install(), log_path=caminho_log)
        servico_chrome.creation_flags = 0x08000000
        
        driver = webdriver.Chrome(service=servico_chrome, options=options)
        driver.set_page_load_timeout(30)
        
        try:
            driver.get("https://web.whatsapp.com")
            time.sleep(2)
            driver.execute_script("window.localStorage.clear();")
            driver.execute_script("window.sessionStorage.clear();")
            driver.delete_all_cookies()
            try:
                driver.execute_script("""
                    window.indexedDB.databases().then((r) => {
                        for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
                    }).catch(() => {});
                """)
            except: pass
            print("WhatsApp desconectado com sucesso.")
            time.sleep(1)
        except Exception as e:
            print(f"Erro ao limpar dados: {e}")
        finally:
            driver.quit()
    except Exception as e:
        print(f"Erro ao abrir driver de limpeza: {e}")

def desconectar_servico(servico):
    print(f"--- DESCONECTANDO: {servico.upper()} ---")
    
    # 1. Avisa pro Painel IMEDIATAMENTE que desligou (Salva no JSON)
    salvar_status_individual(servico, False)
    

    if os.name == 'nt':
        os.system("taskkill /F /IM robo_pro.exe >nul 2>&1")
        os.system("taskkill /F /IM robo_pro-x86_64-pc-windows-msvc.exe >nul 2>&1")
        os.system("taskkill /f /im chromedriver.exe >nul 2>&1")
        os.system("taskkill /f /im chrome.exe >nul 2>&1")
    
    time.sleep(1.5) # Dá tempo pro Windows soltar os arquivos fisicamente
    
   # Fecha o navegador de setup (se houver)
    fechar_navegador()
    

    if servico == "whatsapp":
        limpar_sessao_whatsapp()
        
    elif servico == "telegram":
        try:
            for f in ["sessao_pro.session", "sessao_pro.session-journal", "sessao_temp.session"]:
                if os.path.exists(f): os.remove(f)
        except: pass
    
    return True

def fechar_navegador():
    global driver_config
    if driver_config:
        try: driver_config.quit()
        except: pass
        driver_config = None
