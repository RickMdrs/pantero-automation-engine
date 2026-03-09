import sqlite3
import datetime
import os

DB_NAME = "pantero_dados.db"

def conectar_banco():
    return sqlite3.connect(DB_NAME, timeout=30)

def inicializar_banco():
    try:
        conn = conectar_banco()
        conn.execute('PRAGMA journal_mode=WAL;')
        conn.execute('PRAGMA synchronous=NORMAL;')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS envios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_hora TEXT,
                plataforma TEXT,
                produto_resumo TEXT,
                link_gerado TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT,
                mensagem TEXT,
                data_hora TEXT
            )
        ''')
        # [NOVA TABELA] Notificações
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notificacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT,
                mensagem TEXT,
                tipo TEXT,
                lida INTEGER DEFAULT 0,
                data_hora TEXT
            )
        ''')
        conn.commit()
        conn.close()
    except: pass

def salvar_envio(plataforma, texto_completo, link):
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        
        linhas = texto_completo.split('\n')
        resumo = "Oferta Imperdível"
        for linha in linhas:
            limpa = linha.replace('*', '').replace('`', '').strip()
            if len(limpa) > 5 and "http" not in limpa:
                resumo = limpa[:35] + "..."
                break
        
        data_atual = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('INSERT INTO envios (data_hora, plataforma, produto_resumo, link_gerado) VALUES (?, ?, ?, ?)', 
                      (data_atual, plataforma, resumo, link))
        conn.commit()
        conn.close()
    except: pass

def salvar_log(tipo, mensagem):
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        hora = datetime.datetime.now().strftime("%H:%M:%S")
        cursor.execute('INSERT INTO logs (tipo, mensagem, data_hora) VALUES (?, ?, ?)', (tipo, mensagem, hora))
        cursor.execute('DELETE FROM logs WHERE id NOT IN (SELECT id FROM logs ORDER BY id DESC LIMIT 50)')
        conn.commit()
        conn.close()
    except: pass

# --- FUNÇÕES DE NOTIFICAÇÃO (NOVO) ---
def criar_notificacao(titulo, mensagem, tipo="info"):
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        data_atual = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Evita duplicatas no mesmo dia (opcional, bom para não spammar)
        hoje = datetime.datetime.now().strftime("%Y-%m-%d")
        cursor.execute("SELECT COUNT(*) FROM notificacoes WHERE titulo = ? AND data_hora LIKE ?", (titulo, f"{hoje}%"))
        if cursor.fetchone()[0] > 0:
            conn.close()
            return # Já notificou isso hoje

        cursor.execute('INSERT INTO notificacoes (titulo, mensagem, tipo, data_hora) VALUES (?, ?, ?, ?)', 
                      (titulo, mensagem, tipo, data_atual))
        conn.commit()
        conn.close()
    except: pass

def obter_notificacoes(apenas_nao_lidas=False):
    try:
        conn = conectar_banco()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if apenas_nao_lidas:
            cursor.execute("SELECT * FROM notificacoes WHERE lida = 0 ORDER BY id DESC")
        else:
            cursor.execute("SELECT * FROM notificacoes ORDER BY id DESC LIMIT 20")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except: return []

def marcar_todas_lidas():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        cursor.execute("UPDATE notificacoes SET lida = 1 WHERE lida = 0")
        conn.commit()
        conn.close()
    except: pass

# --- RESTO DAS FUNÇÕES DE STATS E LOGS (MANTIDAS) ---
def obter_dashboard_stats():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        hoje = datetime.datetime.now().strftime("%Y-%m-%d")
        cursor.execute(f"SELECT COUNT(*) FROM envios WHERE data_hora LIKE '{hoje}%'")
        total_hoje = cursor.fetchone()[0]
        cursor.execute(f"SELECT COUNT(*) FROM envios WHERE data_hora LIKE '{hoje}%' AND plataforma='Amazon'")
        amazon_hoje = cursor.fetchone()[0]
        cursor.execute(f"SELECT COUNT(*) FROM envios WHERE data_hora LIKE '{hoje}%' AND plataforma='Mercado Livre'")
        ml_hoje = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM envios")
        total_geral = cursor.fetchone()[0]
        conn.close()
        return {"hoje": total_hoje, "amazon": amazon_hoje, "ml": ml_hoje, "total_geral": total_geral}
    except: return {"hoje": 0, "amazon": 0, "ml": 0, "total_geral": 0}

def obter_logs_recentes():
    try:
        conn = conectar_banco()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
        conn.close()
        return [{"id": r["id"], "type": r["tipo"], "message": r["mensagem"], "timestamp": r["data_hora"]} for r in rows]
    except: return []

def obter_historico_envios(limit=100):
    try:
        conn = conectar_banco()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM envios ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except: return []

def obter_analise_profunda():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        cursor.execute("SELECT plataforma, COUNT(*) FROM envios GROUP BY plataforma")
        share_raw = cursor.fetchall()
        share_dict = {"Amazon": 0, "Mercado Livre": 0}
        total = 0
        for nome, qtd in share_raw:
            if nome in share_dict:
                share_dict[nome] = qtd
                total += qtd
        cursor.execute("SELECT substr(data_hora, 12, 2) as hora, COUNT(*) FROM envios GROUP BY hora ORDER BY COUNT(*) DESC LIMIT 1")
        pico_raw = cursor.fetchone()
        horario_pico = f"{pico_raw[0]}h" if pico_raw else "--"
        conn.close()
        return {"share": share_dict, "total": total, "pico": horario_pico}
    except: return {"share": {"Amazon": 0, "Mercado Livre": 0}, "total": 0, "pico": "--"}

inicializar_banco()