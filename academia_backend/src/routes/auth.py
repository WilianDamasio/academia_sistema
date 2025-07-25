from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session, current_app  
from src.models.academia import Admin, Aluno # Importa nossas novas classes de modelo
from src.database import db # Importa a conexão 'db' do nosso main.py
from functools import wraps
import jwt
from bson import ObjectId # Essencial para buscar por _id no MongoDB

auth_bp = Blueprint('auth', __name__)

# ----------------------------------------------------------------
# DECORATORS (Não precisam de alteração)
# Estes decorators funcionam verificando a 'session' do Flask,
# que não depende diretamente do banco de dados.
# ----------------------------------------------------------------

def login_required(f):
    """Decorator para verificar se o usuário está logado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login necessário'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        # Verifica se o token está no cabeçalho
        if 'Authorization' in request.headers:
            # Pega o token do cabeçalho "Bearer <token>"
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token de autenticação não fornecido'}), 401

        try:
            # Decodifica o token usando a chave secreta da aplicação
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            
            # Verifica se o tipo de usuário no token é 'admin'
            if data.get('user_type') != 'admin':
                return jsonify({'error': 'Acesso negado - Admin necessário'}), 403
            
            # Procura o admin no banco de dados para garantir que ele ainda existe e está ativo
            current_user = db.admins.find_one({'_id': ObjectId(data['user_id']), 'ativo': True})
            if current_user is None:
                return jsonify({'error': 'Usuário administrador não encontrado ou inativo'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        return f(*args, **kwargs)
    return decorated_function

# ----------------------------------------------------------------
# ROTAS DE LOGIN
# ----------------------------------------------------------------

@auth_bp.route('/login/aluno', methods=['POST'])
def login_aluno():
    """Login para alunos (versão MongoDB)"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('senha'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # ---- CONSULTA CORRIGIDA PARA MONGODB ----
    # Usamos db.alunos para acessar a coleção de alunos
    aluno_data = db.alunos.find_one({'email': data['email'], 'ativo': True})
    
    if aluno_data:
        # Cria uma instância da nossa classe Aluno com os dados do banco
        aluno = Aluno(aluno_data)
        # Usa o método da classe para verificar a senha criptografada
        if aluno.check_senha(data['senha']):
            session['user_id'] = str(aluno._id) # Salva o ID do MongoDB como string na sessão
            session['user_type'] = 'aluno'
            return jsonify({
                'message': 'Login realizado com sucesso',
                'user': aluno.to_dict() # Usa o método to_dict para retornar dados seguros
            }), 200
            
    # Se o aluno não foi encontrado ou a senha está errada
    return jsonify({'error': 'Email ou senha inválidos'}), 401

@auth_bp.route('/login/admin', methods=['POST'])
def login_admin():

    """Login para administradores (versão MongoDB)"""
    data = request.get_json()
    # return jsonify(data)

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # ---- CONSULTA CORRIGIDA PARA MONGODB ----
    # Usamos db.admins para acessar a coleção de administradores
    admin_data = db.admins.find_one({'email': data['email'], 'ativo': True})
    
    if admin_data:
        admin = Admin(admin_data)
        if admin.check_senha(data['password']):
            # Gera o token JWT
            token = jwt.encode({
                'user_id': str(admin._id),
                'user_type': 'admin',
                'exp': datetime.utcnow() + timedelta(hours=24) # Token expira em 24 horas
            }, current_app.config['SECRET_KEY'], algorithm="HS256")

            return jsonify({
                'message': 'Login realizado com sucesso',
                'token': token, # Envia o token na resposta
                'user': admin.to_dict()
            }), 200
            
    return jsonify({'error': 'Email ou senha inválidos'}), 401

# ----------------------------------------------------------------
# ROTAS DE SESSÃO
# ----------------------------------------------------------------

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout do usuário (Não precisa de alteração)"""
    session.clear()
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Retorna informações do usuário logado (versão MongoDB)"""
    try:

        #return session['user_id']

        user_id = session['user_id']
        user_type = session['user_type']
        
        user_data = None
        user = None

        # Converte o ID string da sessão para um ObjectId do MongoDB para a busca
        mongo_id = ObjectId(user_id)
        
        # ---- CONSULTA CORRIGIDA PARA MONGODB ----
        if user_type == 'aluno':
            user_data = db.alunos.find_one({'_id': mongo_id})
            if user_data:
                user = Aluno(user_data)
        elif user_type == 'admin':
            user_data = db.admins.find_one({'_id': mongo_id})
            if user_data:
                user = Admin(user_data)
        else:
            return jsonify({'error': 'Tipo de usuário inválido'}), 400
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'user': user.to_dict(),
            'user_type': user_type
        }), 200
    except Exception as e:
        return jsonify({'error': f'Ocorreu um erro: {e}'}), 500