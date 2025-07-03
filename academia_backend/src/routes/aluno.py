from flask import Blueprint, request, jsonify, session
from src.models.academia import TipoAula, Professor, Disponibilidade, Agendamento
from src.routes.auth import login_required
from src.database import db
from datetime import datetime, date

aluno_bp = Blueprint('aluno', __name__)

@aluno_bp.route('/disponibilidades', methods=['GET'])
@login_required
def get_disponibilidades_disponiveis():
    """Lista disponibilidades com vagas para agendamento"""
    # Filtra apenas disponibilidades futuras com vagas disponíveis
    hoje = date.today()
    
    disponibilidades = Disponibilidade.query.filter(
        Disponibilidade.ativo == True,
        Disponibilidade.data >= hoje,
        Disponibilidade.vagas_ocupadas < Disponibilidade.vagas_total
    ).order_by(Disponibilidade.data, Disponibilidade.hora_inicio).all()
    
    return jsonify([disp.to_dict() for disp in disponibilidades]), 200

@aluno_bp.route('/disponibilidades/filtrar', methods=['GET'])
@login_required
def filtrar_disponibilidades():
    """Filtra disponibilidades por tipo de aula, professor ou data"""
    tipo_aula_id = request.args.get('tipo_aula_id', type=int)
    professor_id = request.args.get('professor_id', type=int)
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    query = Disponibilidade.query.filter(
        Disponibilidade.ativo == True,
        Disponibilidade.vagas_ocupadas < Disponibilidade.vagas_total
    )
    
    # Aplica filtros
    if tipo_aula_id:
        query = query.filter(Disponibilidade.tipo_aula_id == tipo_aula_id)
    
    if professor_id:
        query = query.filter(Disponibilidade.professor_id == professor_id)
    
    if data_inicio:
        try:
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            query = query.filter(Disponibilidade.data >= data_inicio_obj)
        except ValueError:
            return jsonify({'error': 'Formato de data_inicio inválido (YYYY-MM-DD)'}), 400
    
    if data_fim:
        try:
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
            query = query.filter(Disponibilidade.data <= data_fim_obj)
        except ValueError:
            return jsonify({'error': 'Formato de data_fim inválido (YYYY-MM-DD)'}), 400
    
    # Se não há filtro de data, mostra apenas futuras
    if not data_inicio and not data_fim:
        hoje = date.today()
        query = query.filter(Disponibilidade.data >= hoje)
    
    disponibilidades = query.order_by(Disponibilidade.data, Disponibilidade.hora_inicio).all()
    
    return jsonify([disp.to_dict() for disp in disponibilidades]), 200

@aluno_bp.route('/agendamentos', methods=['POST'])
@login_required
def criar_agendamento():
    """Cria um novo agendamento"""
    if session.get('user_type') != 'aluno':
        return jsonify({'error': 'Apenas alunos podem fazer agendamentos'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('disponibilidade_id'):
        return jsonify({'error': 'disponibilidade_id é obrigatório'}), 400
    
    disponibilidade = Disponibilidade.query.get_or_404(data['disponibilidade_id'])
    
    # Verifica se a disponibilidade está ativa
    if not disponibilidade.ativo:
        return jsonify({'error': 'Disponibilidade não está ativa'}), 400
    
    # Verifica se há vagas disponíveis
    if disponibilidade.vagas_ocupadas >= disponibilidade.vagas_total:
        return jsonify({'error': 'Não há vagas disponíveis'}), 400
    
    # Verifica se a data não é passada
    if disponibilidade.data < date.today():
        return jsonify({'error': 'Não é possível agendar para datas passadas'}), 400
    
    # Verifica se o aluno já tem agendamento para esta disponibilidade
    agendamento_existente = Agendamento.query.filter_by(
        aluno_id=session['user_id'],
        disponibilidade_id=data['disponibilidade_id'],
        status='confirmado'
    ).first()
    
    if agendamento_existente:
        return jsonify({'error': 'Você já tem um agendamento para esta aula'}), 400
    
    # Cria o agendamento
    agendamento = Agendamento(
        aluno_id=session['user_id'],
        disponibilidade_id=data['disponibilidade_id'],
        observacoes=data.get('observacoes', '')
    )
    
    # Atualiza as vagas ocupadas
    disponibilidade.vagas_ocupadas += 1
    
    try:
        db.session.add(agendamento)
        db.session.commit()
        return jsonify(agendamento.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar agendamento'}), 500

@aluno_bp.route('/meus-agendamentos', methods=['GET'])
@login_required
def get_meus_agendamentos():
    """Lista os agendamentos do aluno logado"""
    if session.get('user_type') != 'aluno':
        return jsonify({'error': 'Apenas alunos podem ver seus agendamentos'}), 403
    
    agendamentos = Agendamento.query.filter_by(
        aluno_id=session['user_id']
    ).order_by(Agendamento.created_at.desc()).all()
    
    return jsonify([agend.to_dict() for agend in agendamentos]), 200

@aluno_bp.route('/agendamentos/<int:agendamento_id>/cancelar', methods=['PUT'])
@login_required
def cancelar_agendamento(agendamento_id):
    """Cancela um agendamento do aluno"""
    if session.get('user_type') != 'aluno':
        return jsonify({'error': 'Apenas alunos podem cancelar seus agendamentos'}), 403
    
    agendamento = Agendamento.query.filter_by(
        id=agendamento_id,
        aluno_id=session['user_id']
    ).first()
    
    if not agendamento:
        return jsonify({'error': 'Agendamento não encontrado'}), 404
    
    if agendamento.status == 'cancelado':
        return jsonify({'error': 'Agendamento já está cancelado'}), 400
    
    # Verifica se ainda é possível cancelar (ex: não pode cancelar no mesmo dia)
    # Esta regra pode ser ajustada conforme necessário
    hoje = date.today()
    if agendamento.disponibilidade.data <= hoje:
        return jsonify({'error': 'Não é possível cancelar agendamentos para hoje ou datas passadas'}), 400
    
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

@aluno_bp.route('/tipos-aula', methods=['GET'])
@login_required
def get_tipos_aula():
    """Lista todos os tipos de aula disponíveis"""
    tipos = TipoAula.query.filter_by(ativo=True).all()
    return jsonify([tipo.to_dict() for tipo in tipos]), 200

@aluno_bp.route('/professores', methods=['GET'])
@login_required
def get_professores():
    """Lista todos os professores ativos"""
    professores = Professor.query.filter_by(ativo=True).all()
    return jsonify([prof.to_dict() for prof in professores]), 200

