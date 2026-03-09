import os
import asyncio
from telethon.sync import TelegramClient
from telethon.errors import SessionPasswordNeededError
from dotenv import load_dotenv

# Loading environment variables for API safety
load_dotenv()

# Session file naming convention
TEMP_SESSION = 'sessao_temp'
FINAL_SESSION = 'sessao_pro'

# Fetching credentials from .env
API_ID = int(os.getenv("TELEGRAM_API_ID", 0))
API_HASH = os.getenv("TELEGRAM_API_HASH", "")

client_temp = None
phone_code_hash = None
phone_number = None

def iniciar_login(telefone):
    """
    Initializes the Telegram authentication handshake.
    Creates a temporary session file to avoid interfering with the main bot process.
    """
    global client_temp, phone_code_hash, phone_number
    
    if client_temp:
        try: client_temp.disconnect()
        except: pass
        client_temp = None

    # Cleaning up previous session artifacts
    for f in [f"{TEMP_SESSION}.session", f"{FINAL_SESSION}.session"]:
        if os.path.exists(f):
            try: os.remove(f)
            except: pass

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        client_temp = TelegramClient(TEMP_SESSION, API_ID, API_HASH, loop=loop)
        client_temp.connect()
        
        if not client_temp.is_user_authorized():
            phone_number = telefone
            sent = client_temp.send_code_request(telefone)
            phone_code_hash = sent.phone_code_hash
            return {"status": "success", "step": "code", "mensagem": "Verification code dispatched."}
        else:
            return {"status": "success", "step": "concluido", "mensagem": "Session already authorized."}
            
    except Exception as e:
        return {"status": "error", "mensagem": f"Telegram Bridge Error: {str(e)}"}

def enviar_codigo(codigo):
    """Submits the verification code and promotes the temporary session to production."""
    global client_temp, phone_code_hash, phone_number
    
    if not client_temp:
        return {"status": "error", "mensagem": "Session expired. Please restart the login process."}
        
    try:
        client_temp.sign_in(phone_number, codigo, phone_code_hash=phone_code_hash)
        client_temp.disconnect()
        client_temp = None 
        
        # Promotion logic: Validating and renaming the temporary session file
        if os.path.exists(f"{TEMP_SESSION}.session"):
            if os.path.exists(f"{FINAL_SESSION}.session"):
                os.remove(f"{FINAL_SESSION}.session")
            
            os.rename(f"{TEMP_SESSION}.session", f"{FINAL_SESSION}.session")
            return {"status": "success", "mensagem": "Authentication successful! Engine released."}
        
        return {"status": "error", "mensagem": "Failed to persist session file."}

    except SessionPasswordNeededError:
        return {"status": "success", "step": "password", "mensagem": "2FA Password Required."}
        
    except Exception as e:
        return {"status": "error", "mensagem": f"Verification Failure: {str(e)}"}

def enviar_senha_2fa(senha):
    """Submits the 2FA password to complete the authentication flow."""
    global client_temp
    
    if not client_temp: return {"status": "error", "mensagem": "Session lost."}
    try:
        client_temp.sign_in(password=senha)
        client_temp.disconnect()
        client_temp = None
        
        if os.path.exists(f"{TEMP_SESSION}.session"):
            if os.path.exists(f"{FINAL_SESSION}.session"):
                os.remove(f"{FINAL_SESSION}.session")
            os.rename(f"{TEMP_SESSION}.session", f"{FINAL_SESSION}.session")

        return {"status": "success", "mensagem": "2FA Authorization successful!"}
    except Exception as e:
        return {"status": "error", "mensagem": f"2FA Failure: {str(e)}"}