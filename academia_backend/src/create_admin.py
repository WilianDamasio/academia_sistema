# Crie este arquivo em academia_backend/src/create_admin.py
# (Ou em qualquer lugar que possa acessar suas variáveis de ambiente e módulos)

import os
import sys
from pymongo import MongoClient
from passlib.hash import bcrypt
from bson import ObjectId # Necessário se você for gerar ObjectIds manualmente

# --- Configuração de Conexão com o Banco de Dados (copiado de src/database.py) ---
# Certifique-se de que DATABASE_URL e DB_NAME estejam definidos como variáveis de ambiente
# quando você executar este script (especialmente se for fora do contexto do Docker Compose).
# Para testar localmente fora do Docker Compose, você pode precisar definir essas variáveis:
# export DATABASE_URL="mongodb://admin:password@localhost:27017/"
# export DB_NAME="academia"

try:
    client = MongoClient(os.environ.get('DATABASE_URL'))
    # Acessa o banco de dados 'academia'. O nome 'academia_db' é um fallback de variável de ambiente.
    # No seu docker-compose.yml, o nome do banco de dados é "academia" via DB_NAME.
    db = client[os.environ.get('DB_NAME', 'academia')]
    client.server_info() # Testa a conexão
    print("Conexão com MongoDB estabelecida com sucesso.")
except Exception as e:
    print(f"ERRO CRÍTICO: Não foi possível conectar ao MongoDB. Verifique as variáveis de ambiente. Erro: {e}")
    sys.exit(1)

# --- Função para Criar/Atualizar Administrador ---
def create_admin_user(email, password, nome):
    """
    Cria ou atualiza um documento de administrador na coleção 'admins' do MongoDB.
    Hacheia a senha antes de salvar.
    """
    admins_collection = db.admins # Acessa a coleção 'admins' do banco de dados 'academia'

    # 1. Hacheia a senha fornecida
    hashed_password = bcrypt.hash(password)

    # 2. Prepara o documento do administrador
    admin_document = {
        "nome": nome,
        "email": email,
        "senha_hash": hashed_password,
        "ativo": True,
        # '_id': ObjectId() # Opcional: MongoDB irá gerar um _id se não for fornecido
    }

    try:
        # 3. Verifica se um administrador com o mesmo email já existe
        # Se existir, atualiza. Se não, insere.
        result = admins_collection.update_one(
            {"email": email}, # Filtro para encontrar o documento
            {"$set": admin_document}, # Campos para atualizar/inserir
            upsert=True # Se não encontrar, insere um novo documento
        )
        
        if result.upserted_id:
            print(f"Administrador '{email}' criado com sucesso (ID: {result.upserted_id}).")
        elif result.matched_count > 0:
            print(f"Administrador '{email}' atualizado com sucesso.")
        else:
            print(f"Administrador '{email}' não foi criado nem atualizado (nenhum match e upsert não ocorreu).")
            
        return True
    except Exception as e:
        print(f"Erro ao criar/atualizar administrador: {e}")
        return False

# --- Execução Principal do Script ---
if __name__ == "__main__":
    # Dados do administrador que você deseja criar/atualizar
    ADMIN_EMAIL = "admin@academia.com"
    ADMIN_PASSWORD = "admin123" # A senha que você quer
    ADMIN_NAME = "Administrador Principal"

    print(f"Iniciando a criação/atualização do administrador: {ADMIN_EMAIL}")
    success = create_admin_user(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)

    if success:
        print("Operação concluída com êxito.")
    else:
        print("Falha na operação de criação/atualização.")