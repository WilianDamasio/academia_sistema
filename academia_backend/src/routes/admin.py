# src/routes/admin.py (VERSÃO COMPLETA E CORRIGIDA PARA MONGODB)

from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime

# Importações principais
from src.models.academia import Aluno, Professor, TipoAula, Disponibilidade, Agendamento
from src.database import db
from src.routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)

# ===== TIPOS DE AULA =====

@admin_bp.route('/tipos-aula', methods=['GET'])
@admin_required
def get_tipos_aula():
    """Lista todos os tipos de aula ativos (MongoDB)"""
    try:
        tipos_cursor = db.tipos_aula.find({'ativo': True})
        tipos_lista = [TipoAula(tipo).to_dict() for tipo in tipos_cursor]
        return jsonify(tipos_lista), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar tipos de aula: {e}'}), 500

@admin_bp.route('/tipos-aula', methods=['POST'])
@admin_required
def create_tipo_aula():
    """Cria um novo tipo de aula (MongoDB)"""
    data = request.get_json()
    if not data or not data.get('nome'):
        return jsonify({'error': 'Nome é obrigatório'}), 400
    
    try:
        novo_tipo_doc = {
            "nome": data['nome'],
            "descricao": data.get('descricao', ''),
            "ativo": True
        }
        result = db.tipos_aula.insert_one(novo_tipo_doc)
        tipo_criado = db.tipos_aula.find_one({'_id': result.inserted_id})
        return jsonify(TipoAula(tipo_criado).to_dict()), 201
    except Exception as e:
        return jsonify({'error': 'Erro ao criar tipo de aula'}), 500

@admin_bp.route('/tipos-aula/<string:tipo_id>', methods=['PUT'])
@admin_required
def update_tipo_aula(tipo_id):
    """Atualiza um tipo de aula (MongoDB)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
        
    try:
        oid = ObjectId(tipo_id)
    except Exception:
        return jsonify({'error': 'ID de tipo de aula inválido'}), 400

    update_fields = {}
    if 'nome' in data:
        update_fields['nome'] = data['nome']
    if 'descricao' in data:
        update_fields['descricao'] = data['descricao']
    if 'ativo' in data:
        update_fields['ativo'] = data['ativo']

    if not update_fields:
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400

    try:
        db.tipos_aula.update_one({'_id': oid}, {'$set': update_fields})
        tipo_atualizado = db.tipos_aula.find_one({'_id': oid})
        return jsonify(TipoAula(tipo_atualizado).to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Erro ao atualizar tipo de aula'}), 500

@admin_bp.route('/tipos-aula/<string:tipo_id>', methods=['DELETE'])
@admin_required
def delete_tipo_aula(tipo_id):
    """Remove um tipo de aula (soft delete - MongoDB)"""
    try:
        oid = ObjectId(tipo_id)
        result = db.tipos_aula.update_one({'_id': oid}, {'$set': {'ativo': False}})
        if result.matched_count == 0:
            return jsonify({'error': 'Tipo de aula não encontrado'}), 404
        return jsonify({'message': 'Tipo de aula removido com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': 'Erro ao remover tipo de aula'}), 500

# ===== PROFESSORES =====

@admin_bp.route('/professores', methods=['GET'])
@admin_required
def get_professores():
    """Lista todos os professores ativos (MongoDB)"""
    try:
        professores_cursor = db.professores.find({'ativo': True})
        professores_lista = [Professor(prof).to_dict() for prof in professores_cursor]
        return jsonify(professores_lista), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar professores: {e}'}), 500

@admin_bp.route('/professores', methods=['POST'])
@admin_required
def create_professor():
    """Cria um novo professor (MongoDB)"""
    data = request.get_json()
    if not data or not data.get('nome') or not data.get('email'):
        return jsonify({'error': 'Nome e email são obrigatórios'}), 400
    
    if db.professores.find_one({'email': data['email']}):
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    try:
        novo_professor_doc = {
            "nome": data['nome'],
            "email": data['email'],
            "telefone": data.get('telefone', ''),
            "especialidade": data.get('especialidade', ''),
            "ativo": True
        }
        result = db.professores.insert_one(novo_professor_doc)
        professor_criado = db.professores.find_one({'_id': result.inserted_id})
        return jsonify(Professor(professor_criado).to_dict()), 201
    except Exception as e:
        return jsonify({'error': 'Erro ao criar professor'}), 500

@admin_bp.route('/professores/<string:professor_id>', methods=['PUT'])
@admin_required
def update_professor(professor_id):
    """Atualiza um professor (MongoDB)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400

    try:
        oid = ObjectId(professor_id)
    except Exception:
        return jsonify({'error': 'ID de professor inválido'}), 400

    update_fields = {}
    if 'nome' in data:
        update_fields['nome'] = data['nome']
    if 'email' in data:
        if db.professores.find_one({'email': data['email'], '_id': {'$ne': oid}}):
            return jsonify({'error': 'Email já cadastrado'}), 400
        update_fields['email'] = data['email']
    if 'telefone' in data:
        update_fields['telefone'] = data['telefone']
    if 'especialidade' in data:
        update_fields['especialidade'] = data['especialidade']
    if 'ativo' in data:
        update_fields['ativo'] = data['ativo']

    if not update_fields:
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400

    try:
        db.professores.update_one({'_id': oid}, {'$set': update_fields})
        professor_atualizado = db.professores.find_one({'_id': oid})
        return jsonify(Professor(professor_atualizado).to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Erro ao atualizar professor'}), 500

@admin_bp.route('/professores/<string:professor_id>', methods=['DELETE'])
@admin_required
def delete_professor(professor_id):
    """Remove um professor (soft delete - MongoDB)"""
    try:
        oid = ObjectId(professor_id)
        result = db.professores.update_one({'_id': oid}, {'$set': {'ativo': False}})
        if result.matched_count == 0:
            return jsonify({'error': 'Professor não encontrado'}), 404
        return jsonify({'message': 'Professor removido com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': 'Erro ao remover professor'}), 500

# ===== ALUNOS =====
# (As rotas de alunos que corrigi anteriormente já estão corretas)

@admin_bp.route('/alunos', methods=['GET'])
@admin_required
def get_alunos():
    """Lista todos os alunos ativos (versão MongoDB)"""
    try:
        alunos_cursor = db.alunos.find({'ativo': True})
        alunos_lista = [Aluno(aluno_data).to_dict() for aluno_data in alunos_cursor]
        return jsonify(alunos_lista), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar alunos: {e}'}), 500

@admin_bp.route('/alunos', methods=['POST'])
@admin_required
def create_aluno():
    """Cria um novo aluno (versão MongoDB)"""
    data = request.get_json()
    
    if not data or not data.get('nome') or not data.get('email') or not data.get('senha'):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    if db.alunos.find_one({'email': data['email']}):
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    novo_aluno_doc = {
        "nome": data['nome'],
        "email": data['email'],
        "telefone": data.get('telefone', ''),
        "ativo": True,
        "created_at": datetime.utcnow()
    }
    
    temp_aluno = Aluno({})
    temp_aluno.set_senha(data['senha'])
    novo_aluno_doc['senha_hash'] = temp_aluno.senha_hash

    try:
        result = db.alunos.insert_one(novo_aluno_doc)
        aluno_criado = db.alunos.find_one({'_id': result.inserted_id})
        return jsonify(Aluno(aluno_criado).to_dict()), 201
    except Exception as e:
        return jsonify({'error': f'Erro ao criar aluno: {e}'}), 500

@admin_bp.route('/alunos/<string:aluno_id>', methods=['PUT'])
@admin_required
def update_aluno(aluno_id):
    """Atualiza um aluno (versão MongoDB)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400

    try:
        oid = ObjectId(aluno_id)
    except Exception:
        return jsonify({'error': 'ID de aluno inválido'}), 400
        
    update_fields = {}
    if 'nome' in data:
        update_fields['nome'] = data['nome']
    if 'email' in data:
        if db.alunos.find_one({'email': data['email'], '_id': {'$ne': oid}}):
            return jsonify({'error': 'Email já cadastrado'}), 400
        update_fields['email'] = data['email']
    if 'telefone' in data:
        update_fields['telefone'] = data['telefone']
    if 'ativo' in data:
        update_fields['ativo'] = data['ativo']
    if 'senha' in data and data['senha']:
        temp_aluno = Aluno({})
        temp_aluno.set_senha(data['senha'])
        update_fields['senha_hash'] = temp_aluno.senha_hash

    if not update_fields:
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400

    try:
        db.alunos.update_one({'_id': oid}, {'$set': update_fields})
        aluno_atualizado = db.alunos.find_one({'_id': oid})
        return jsonify(Aluno(aluno_atualizado).to_dict()), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao atualizar aluno: {e}'}), 500

@admin_bp.route('/alunos/<string:aluno_id>', methods=['DELETE'])
@admin_required
def delete_aluno(aluno_id):
    """Remove um aluno (soft delete - versão MongoDB)"""
    try:
        oid = ObjectId(aluno_id)
        result = db.alunos.update_one({'_id': oid}, {'$set': {'ativo': False}})
        if result.matched_count == 0:
            return jsonify({'error': 'Aluno não encontrado'}), 404
        return jsonify({'message': 'Aluno removido com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao remover aluno: {e}'}), 500

# ===== DISPONIBILIDADES =====

@admin_bp.route('/disponibilidades', methods=['GET'])
@admin_required
def get_disponibilidades():
    """Lista todas as disponibilidades ativas (MongoDB)"""
    try:
        disponibilidades_cursor = db.disponibilidades.find({'ativo': True})
        # Aqui, vamos enriquecer os dados com informações de professor e tipo de aula
        lista_final = []
        for disp_data in disponibilidades_cursor:
            disp = Disponibilidade(disp_data).to_dict()
            # Busca o professor e tipo de aula correspondentes
            professor = db.professores.find_one({'_id': ObjectId(disp_data['professor_id'])})
            tipo_aula = db.tipos_aula.find_one({'_id': ObjectId(disp_data['tipo_aula_id'])})
            
            disp['professor'] = Professor(professor).to_dict() if professor else None
            disp['tipo_aula'] = TipoAula(tipo_aula).to_dict() if tipo_aula else None
            
            lista_final.append(disp)
        
        return jsonify(lista_final), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar disponibilidades: {e}'}), 500

@admin_bp.route('/disponibilidades', methods=['POST'])
@admin_required
def create_disponibilidade():
    """Cria uma nova disponibilidade (MongoDB)"""
    data = request.get_json()
    required_fields = ['data', 'hora_inicio', 'hora_fim', 'vagas_total', 'tipo_aula_id', 'professor_id']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    
    try:
        nova_disp_doc = {
            "data": datetime.strptime(data['data'], '%Y-%m-%d'),
            "hora_inicio": data['hora_inicio'],
            "hora_fim": data['hora_fim'],
            "vagas_total": int(data['vagas_total']),
            "vagas_ocupadas": 0,
            "tipo_aula_id": ObjectId(data['tipo_aula_id']),
            "professor_id": ObjectId(data['professor_id']),
            "ativo": True
        }
        
        db.disponibilidades.insert_one(nova_disp_doc)
        return jsonify({'message': 'Disponibilidade criada com sucesso'}), 201
    except ValueError:
        return jsonify({'error': 'Formato de data/hora ou número inválido'}), 400
    except Exception as e:
        return jsonify({'error': f'Erro ao criar disponibilidade: {e}'}), 500

@admin_bp.route('/disponibilidades/<string:disponibilidade_id>', methods=['DELETE'])
@admin_required
def delete_disponibilidade(disponibilidade_id):
    """Remove uma disponibilidade (soft delete - MongoDB)"""
    try:
        oid = ObjectId(disponibilidade_id)
        
        agendamentos_confirmados = db.agendamentos.count_documents({
            'disponibilidade_id': oid,
            'status': 'confirmado'
        })
    
        if agendamentos_confirmados > 0:
            return jsonify({'error': 'Não é possível remover disponibilidade com agendamentos confirmados'}), 400

        result = db.disponibilidades.update_one({'_id': oid}, {'$set': {'ativo': False}})
        if result.matched_count == 0:
            return jsonify({'error': 'Disponibilidade não encontrada'}), 404

        return jsonify({'message': 'Disponibilidade removida com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao remover disponibilidade: {e}'}), 500

# ===== AGENDAMENTOS =====

@admin_bp.route('/agendamentos', methods=['GET'])
@admin_required
def get_agendamentos():
    """Lista todos os agendamentos (MongoDB)"""
    try:
        agendamentos_cursor = db.agendamentos.find({})
        
        lista_final = []
        for agend_data in agendamentos_cursor:
            agendamento = Agendamento(agend_data).to_dict()
            
            aluno = db.alunos.find_one({'_id': ObjectId(agend_data['aluno_id'])})
            disponibilidade_data = db.disponibilidades.find_one({'_id': ObjectId(agend_data['disponibilidade_id'])})
            
            disponibilidade = {}
            if disponibilidade_data:
                disponibilidade = Disponibilidade(disponibilidade_data).to_dict()
                professor = db.professores.find_one({'_id': ObjectId(disponibilidade_data['professor_id'])})
                tipo_aula = db.tipos_aula.find_one({'_id': ObjectId(disponibilidade_data['tipo_aula_id'])})
                disponibilidade['professor'] = Professor(professor).to_dict() if professor else None
                disponibilidade['tipo_aula'] = TipoAula(tipo_aula).to_dict() if tipo_aula else None

            agendamento['aluno'] = Aluno(aluno).to_dict() if aluno else None
            agendamento['disponibilidade'] = disponibilidade
            
            lista_final.append(agendamento)
            
        return jsonify(lista_final), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar agendamentos: {e}'}), 500

@admin_bp.route('/agendamentos/<string:agendamento_id>/cancelar', methods=['PUT'])
@admin_required
def cancel_agendamento(agendamento_id):
    """Cancela um agendamento (MongoDB)"""
    try:
        oid = ObjectId(agendamento_id)
        agendamento = db.agendamentos.find_one({'_id': oid})

        if not agendamento:
            return jsonify({'error': 'Agendamento não encontrado'}), 404
        
        if agendamento['status'] == 'cancelado':
            return jsonify({'error': 'Agendamento já está cancelado'}), 400
        
        # Atualiza o status do agendamento
        db.agendamentos.update_one(
            {'_id': oid},
            {'$set': {'status': 'cancelado', 'canceled_at': datetime.utcnow()}}
        )
        
        # Libera a vaga na disponibilidade
        db.disponibilidades.update_one(
            {'_id': ObjectId(agendamento['disponibilidade_id'])},
            {'$inc': {'vagas_ocupadas': -1}}
        )
        
        return jsonify({'message': 'Agendamento cancelado com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao cancelar agendamento: {e}'}), 500