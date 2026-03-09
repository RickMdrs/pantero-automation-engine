import subprocess
import os
import sys

# Descobre a pasta exata de onde o cliente clicou
if getattr(sys, 'frozen', False):
    pasta_atual = os.path.dirname(sys.executable)
else:
    pasta_atual = os.path.dirname(os.path.abspath(__file__))

# Mude para este caminho novo (adicionando a subpasta)
caminho_api = os.path.join(pasta_atual, "sistema", "api", "api.exe")
caminho_robo = os.path.join(pasta_atual, "sistema", "robo_pro", "robo_pro.exe")

# Dá a partida nos dois ao mesmo tempo!
subprocess.Popen([caminho_api])
subprocess.Popen([caminho_robo])