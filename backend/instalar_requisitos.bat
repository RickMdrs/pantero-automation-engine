@echo off
title Instalador COMPLETO - Pantero IA
color 0A

echo 
echo  
echo 
echo.

:: 1. Garante que o instalador (PIP) esta na ultima versao
echo [1/4] Atualizando o instalador...
python -m pip install --upgrade pip

:: 2. Instala as dependencias do SERVIDOR (api.py)
:: Corrige: fastapi, uvicorn, pydantic, psutil
echo.
echo [2/4] Instalando dependencias do Servidor...
pip install fastapi uvicorn pydantic psutil requests

:: 3. Instala as dependencias do ROBO (robo_pro.py / conectar_contas.py)

echo [3/4] Instalando dependencias do Robo...
pip install selenium webdriver-manager telethon httpx Pillow pywin32 pyperclip

:: 4. Instala a Licenca (keyauth.py)

echo.
echo [4/4] Instalando sistema de Licenca...
pip install keyauth

echo.
echo ==================================================
echo      TUDO INSTALADO! PODE FECHAR.
echo ==================================================
echo.
pause
