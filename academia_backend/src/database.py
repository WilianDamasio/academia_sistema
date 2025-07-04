# /usr/src/app/src/database.py

import os
import sys
from pymongo import MongoClient

try:
    # Lê a URL de conexão do MongoDB a partir das variáveis de ambiente
    client = MongoClient(os.environ.get('DATABASE_URL'))
    
    # Testa a conexão para garantir que o banco está acessível
    client.server_info() 
    
    # Seleciona o banco de dados.
    # É uma boa prática usar uma variável de ambiente específica para o nome do banco.
    db = client[os.environ.get('DB_NAME', 'academia')]
    
except Exception as e:
    # Se não conseguir conectar, o app não deve subir.
    print(f"ERRO CRÍTICO: Não foi possível conectar ao MongoDB. Verifique as variáveis de ambiente. Erro: {e}")
    sys.exit(1)