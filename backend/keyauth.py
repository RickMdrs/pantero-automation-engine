import json
import time
import sys
import os
import hashlib
import binascii
import requests
from datetime import datetime

class api:
    def __init__(self, name, ownerid, secret, version, hash_to_check=None):
        self.name = name
        self.ownerid = ownerid
        self.secret = secret
        self.version = version
        self.hash_to_check = hash_to_check
        # Init manual

    def init(self):
        self.sessionid = binascii.b2a_hex(os.urandom(16)).decode()
        self.session_expiry = datetime.fromtimestamp(int(time.time()) + 1800)
        post_data = {
            "type": "init",
            "ver": self.version,
            "hash": self.hash_to_check,
            "name": self.name,
            "ownerid": self.ownerid,
            "sessionid": self.sessionid
        }
        
        try:
            response = self.__make_request(post_data)
            if response == "KeyAuth_Invalid":
                print("❌ KeyAuth: App não encontrado.")
                return False
            
            json_data = json.loads(response)
            if json_data.get("success"):
                # [AQUI ESTAVA O BUG ANTES] O ID real vem do servidor:
                self.sessionid = json_data.get("sessionid") 
                self.app_data = json_data.get("appinfo")
                return True
            else:
                self.last_message = json_data.get('message')
                return False
        except Exception as e:
            self.last_message = str(e)
            return False

    def login(self, username, password):
        post_data = {
            "type": "login",
            "username": username,
            "pass": password,
            "hwid": self.__get_hwid(),
            "sessionid": self.sessionid,
            "name": self.name,
            "ownerid": self.ownerid
        }
        
        try:
            response = self.__make_request(post_data)
            json_data = json.loads(response)
            if json_data.get("success"):
                self.user_data = json_data.get("info")
                return True
            else:
                self.last_message = json_data.get("message") 
                return False
        except:
            return False

    def license(self, key):
        post_data = {
            "type": "license",
            "key": key,
            "hwid": self.__get_hwid(),
            "sessionid": self.sessionid,
            "name": self.name,
            "ownerid": self.ownerid
        }
        try:
            response = self.__make_request(post_data)
            json_data = json.loads(response)
            if json_data.get("success"):
                self.user_data = json_data.get("info")
                return True
            else:
                return False
        except:
            return False

    def __get_hwid(self):
        if os.name == 'nt':
            import subprocess
            try:
                hwid = subprocess.check_output('wmic csproduct get uuid', shell=True).decode().split('\n')[1].strip()
                return hwid
            except:
                return "HWID_Error"
        else:
            return "Linux_HWID"

    def __make_request(self, data):
        url = "https://keyauth.win/api/1.2/"
        try:
            response = requests.post(url, data=data, timeout=10)
            return response.text
        except:
            return "Error"