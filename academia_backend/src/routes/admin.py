from flask import Blueprint, request, jsonify
from src.models.academia import TipoAula, Professor, Aluno, Disponibilidade, Agendamento
from src.routes.auth import admin_required
from src.database import db
from datetime import datetime, date, time

admin_bp = Blueprint('admin', __name__)

# ===== TIPOS DE AULA =====

@admin_bp.route('/tipos-aula', methods=['GET'])
@admin_required
def get_tipos_aula():
    """Lista todos os tipos de aula"""
    tipos = TipoAula.query.filter_by(ativo=True).all()
    return jsonify([tipo.to_dict() for tipo in tipos]), 200

@admin_bp.route('/tipos-aula', methods=['POST'])
@admin_required
def create_tipo_aula():
    """Cria um novo tipo de aula"""
    data = request.get_json()
    
    if not data or not data.get('nome'):
        return jsonify({'error': 'Nome é obrigatório'}), 400
    
    tipo = TipoAula(
        nome=data['nome'],
        descricao=data.get('descricao', '')
    )
    
    try:
        db.session.add(tipo)
        db.session.commit()
        return jsonify(tipo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar tipo de aula'}), 500

@admin_bp.route('/tipos-aula/<int:tipo_id>', methods=['PUT'])
@admin_required
def update_tipo_aula(tipo_id):
    """Atualiza um tipo de aula"""
    tipo = TipoAula.query.get_or_404(tipo_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    if 'nome' in data:
        tipo.nome = data['nome']
    if 'descricao' in data:
        tipo.descricao = data['descricao']
    if 'ativo' in data:
        tipo.ativo = data['ativo']
    
    try:
        db.session.commit()
        return jsonify(tipo.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao atualizar tipo de aula'}), 500

@admin_bp.route('/tipos-aula/<int:tipo_id>', methods=['DELETE'])
@admin_required
def delete_tipo_aula(tipo_id):
    """Remove um tipo de aula (soft delete)"""
    tipo = TipoAula.query.get_or_404(tipo_id)
    tipo.ativo = False
    
    try:
        db.session.commit()
        return jsonify({'message': 'Tipo de aula removido com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao remover tipo de aula'}), 500

# ===== PROFESSORES =====

@admin_bp.route('/professores', methods=['GET'])
@admin_required
def get_professores():
    """Lista todos os professores"""
    professores = Professor.query.filter_by(ativo=True).all()
    return jsonify([prof.to_dict() for prof in professores]), 200

@admin_bp.route('/professores', methods=['POST'])
@admin_required
def create_professor():
    """Cria um novo professor"""
    data = request.get_json()
    
    if not data or not data.get('nome') or not data.get('email'):
        return jsonify({'error': 'Nome e email são obrigatórios'}), 400
    
    # Verifica se email já existe
    if Professor.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    professor = Professor(
        nome=data['nome'],
        email=data['email'],
        telefone=data.get('telefone', ''),
        especialidade=data.get('especialidade', '')
    )
    
    try:
        db.session.add(professor)
        db.session.commit()
        return jsonify(professor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar professor'}), 500

@admin_bp.route('/professores/<int:professor_id>', methods=['PUT'])
@admin_required
def update_professor(professor_id):
    """Atualiza um professor"""
    professor = Professor.query.get_or_404(professor_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    # Verifica se email já existe (exceto o próprio professor)
    if 'email' in data and data['email'] != professor.email:
        if Professor.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
    
    if 'nome' in data:
        professor.nome = data['nome']
    if 'email' in data:
        professor.email = data['email']
    if 'telefone' in data:
        professor.telefone = data['telefone']
    if 'especialidade' in data:
        professor.especialidade = data['especialidade']
    if 'ativo' in data:
        professor.ativo = data['ativo']
    
    try:
        db.session.commit()
        return jsonify(professor.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao atualizar professor'}), 500

@admin_bp.route('/professores/<int:professor_id>', methods=['DELETE'])
@admin_required
def delete_professor(professor_id):
    """Remove um professor (soft delete)"""
    professor = Professor.query.get_or_404(professor_id)
    professor.ativo = False
    
    try:
        db.session.commit()
        return jsonify({'message': 'Professor removido com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao remover professor'}), 500

@admin_bp.route('/professores/<int:professor_id>/tipos-aula', methods=['POST'])
@admin_required
def associate_professor_tipo_aula(professor_id):
    """Associa um professor a um tipo de aula"""
    professor = Professor.query.get_or_404(professor_id)
    data = request.get_json()
    
    if not data or not data.get('tipo_aula_id'):
        return jsonify({'error': 'tipo_aula_id é obrigatório'}), 400
    
    tipo_aula = TipoAula.query.get_or_404(data['tipo_aula_id'])
    
    if tipo_aula not in professor.tipos_aula:
        professor.tipos_aula.append(tipo_aula)
        try:
            db.session.commit()
            return jsonify({'message': 'Associação criada com sucesso'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Erro ao criar associação'}), 500
    else:
        return jsonify({'message': 'Associação já existe'}), 200

@admin_bp.route('/professores/<int:professor_id>/tipos-aula/<int:tipo_aula_id>', methods=['DELETE'])
@admin_required
def disassociate_professor_tipo_aula(professor_id, tipo_aula_id):
    """Remove a associação entre professor e tipo de aula"""
    professor = Professor.query.get_or_404(professor_id)
    tipo_aula = TipoAula.query.get_or_404(tipo_aula_id)
    
    if tipo_aula in professor.tipos_aula:
        professor.tipos_aula.remove(tipo_aula)
        try:
            db.session.commit()
            return jsonify({'message': 'Associação removida com sucesso'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Erro ao remover associação'}), 500
    else:
        return jsonify({'error': 'Associação não existe'}), 404

# ===== ALUNOS =====

@admin_bp.route('/alunos', methods=['GET'])
@admin_required
def get_alunos():
    """Lista todos os alunos"""
    alunos = Aluno.query.filter_by(ativo=True).all()
    return jsonify([aluno.to_dict() for aluno in alunos]), 200

@admin_bp.route('/alunos', methods=['POST'])
@admin_required
def create_aluno():
    """Cria um novo aluno"""
    data = request.get_json()
    
    if not data or not data.get('nome') or not data.get('email') or not data.get('senha'):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    # Verifica se email já existe
    if Aluno.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    aluno = Aluno(
        nome=data['nome'],
        email=data['email'],
        telefone=data.get('telefone', '')
    )
    aluno.set_senha(data['senha'])
    
    try:
        db.session.add(aluno)
        db.session.commit()
        return jsonify(aluno.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar aluno'}), 500

@admin_bp.route('/alunos/<int:aluno_id>', methods=['PUT'])
@admin_required
def update_aluno(aluno_id):
    """Atualiza um aluno"""
    aluno = Aluno.query.get_or_404(aluno_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados não fornecidos'}), 400
    
    # Verifica se email já existe (exceto o próprio aluno)
    if 'email' in data and data['email'] != aluno.email:
        if Aluno.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
    
    if 'nome' in data:
        aluno.nome = data['nome']
    if 'email' in data:
        aluno.email = data['email']
    if 'telefone' in data:
        aluno.telefone = data['telefone']
    if 'senha' in data:
        aluno.set_senha(data['senha'])
    if 'ativo' in data:
        aluno.ativo = data['ativo']
    
    try:
        db.session.commit()
        return jsonify(aluno.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao atualizar aluno'}), 500

@admin_bp.route('/alunos/<int:aluno_id>', methods=['DELETE'])
@admin_required
def delete_aluno(aluno_id):
    """Remove um aluno (soft delete)"""
    aluno = Aluno.query.get_or_404(aluno_id)
    aluno.ativo = False
    
    try:
        db.session.commit()
        return jsonify({'message': 'Aluno removido com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao remover aluno'}), 500

# ===== DISPONIBILIDADES =====

@admin_bp.route('/disponibilidades', methods=['GET'])
@admin_required
def get_disponibilidades():
    """Lista todas as disponibilidades"""
    disponibilidades = Disponibilidade.query.filter_by(ativo=True).all()
    return jsonify([disp.to_dict() for disp in disponibilidades]), 200

@admin_bp.route('/disponibilidades', methods=['POST'])
@admin_required
def create_disponibilidade():
    """Cria uma nova disponibilidade"""
    data = request.get_json()
    
    required_fields = ['data', 'hora_inicio', 'hora_fim', 'vagas_total', 'tipo_aula_id', 'professor_id']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    
    try:
        # Converte strings para objetos date e time
        data_obj = datetime.strptime(data['data'], '%Y-%m-%d').date()
        hora_inicio_obj = datetime.strptime(data['hora_inicio'], '%H:%M').time()
        hora_fim_obj = datetime.strptime(data['hora_fim'], '%H:%M').time()
        
        disponibilidade = Disponibilidade(
            data=data_obj,
            hora_inicio=hora_inicio_obj,
            hora_fim=hora_fim_obj,
            vagas_total=data['vagas_total'],
            tipo_aula_id=data['tipo_aula_id'],
            professor_id=data['professor_id']
        )
        
        db.session.add(disponibilidade)
        db.session.commit()
        return jsonify(disponibilidade.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': 'Formato de data/hora inválido'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar disponibilidade'}), 500

@admin_bp.route('/disponibilidades/<int:disponibilidade_id>', methods=['DELETE'])
@admin_required
def delete_disponibilidade(disponibilidade_id):
    """Remove uma disponibilidade (soft delete)"""
    disponibilidade = Disponibilidade.query.get_or_404(disponibilidade_id)
    
    # Verifica se há agendamentos confirmados
    agendamentos_confirmados = Agendamento.query.filter_by(
        disponibilidade_id=disponibilidade_id,
        status='confirmado'
    ).count()
    
    if agendamentos_confirmados > 0:
        return jsonify({'error': 'Não é possível remover disponibilidade com agendamentos confirmados'}), 400
    
    disponibilidade.ativo = False
    
    try:
        db.session.commit()
        return jsonify({'message': 'Disponibilidade removida com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao remover disponibilidade'}), 500

# ===== AGENDAMENTOS =====

@admin_bp.route('/agendamentos', methods=['GET'])
@admin_required
def get_agendamentos():
    """Lista todos os agendamentos"""
    agendamentos = Agendamento.query.all()
    return jsonify([agend.to_dict() for agend in agendamentos]), 200

@admin_bp.route('/agendamentos/<int:agendamento_id>/cancelar', methods=['PUT'])
@admin_required
def cancel_agendamento(agendamento_id):
    """Cancela um agendamento"""
    agendamento = Agendamento.query.get_or_404(agendamento_id)
    
    if agendamento.status == 'cancelado':
        return jsonify({'error': 'Agendamento já está cancelado'}), 400
    
    agendamento.status = 'cancelado'
    agendamento.canceled_at = datetime.utcnow()
    
    # Libera a vaga
    disponibilidade = agendamento.disponibilidade
    disponibilidade.vagas_ocupadas -= 1
    
    try:
        db.session.commit()
        return jsonify({'message': 'Agendamento cancelado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao cancelar agendamento'}), 500

