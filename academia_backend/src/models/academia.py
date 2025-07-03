from passlib.hash import bcrypt
from bson import ObjectId # Essencial para lidar com o _id do MongoDB

# -------------------
# Modelos de Usuário
# -------------------

class Admin:
    """Representa um administrador no sistema."""
    def __init__(self, data):
        self._id = data.get('_id')
        self.nome = data.get('nome')
        self.email = data.get('email')
        self.senha_hash = data.get('senha_hash')
        self.ativo = data.get('ativo', True)

    def set_senha(self, senha):
        self.senha_hash = bcrypt.hash(senha)

    def check_senha(self, senha):
        if not self.senha_hash:
            return False
        return bcrypt.verify(senha, self.senha_hash)

    def to_dict(self):
        return {
            'id': str(self._id),
            'nome': self.nome,
            'email': self.email,
            'ativo': self.ativo
        }

class Aluno:
    """Representa um aluno no sistema."""
    def __init__(self, data):
        self._id = data.get('_id')
        self.nome = data.get('nome')
        self.email = data.get('email')
        self.senha_hash = data.get('senha_hash')
        self.ativo = data.get('ativo', True)
        # Outros campos podem ser adicionados aqui
        self.creditos = data.get('creditos', 0)

    def set_senha(self, senha):
        self.senha_hash = bcrypt.hash(senha)

    def check_senha(self, senha):
        if not self.senha_hash:
            return False
        return bcrypt.verify(senha, self.senha_hash)

    def to_dict(self):
        return {
            'id': str(self._id),
            'nome': self.nome,
            'email': self.email,
            'ativo': self.ativo,
            'creditos': self.creditos
        }

class Professor:
    """Representa um professor no sistema."""
    def __init__(self, data):
        self._id = data.get('_id')
        self.nome = data.get('nome')
        self.email = data.get('email')
        self.ativo = data.get('ativo', True)

    def to_dict(self):
        return {
            'id': str(self._id),
            'nome': self.nome,
            'email': self.email,
            'ativo': self.ativo
        }

# -------------------
# Modelos de Academia
# -------------------

class TipoAula:
    """Representa um tipo de aula oferecido, como Yoga, Pilates, etc."""
    def __init__(self, data):
        self._id = data.get('_id')
        self.nome = data.get('nome')
        self.descricao = data.get('descricao')

    def to_dict(self):
        return {
            'id': str(self._id),
            'nome': self.nome,
            'descricao': self.descricao
        }

class Disponibilidade:
    """Representa um horário em que um professor está disponível para dar uma aula."""
    def __init__(self, data):
        self._id = data.get('_id')
        # No MongoDB, é comum salvar IDs como referência
        self.professor_id = str(data.get('professor_id')) 
        self.dia_semana = data.get('dia_semana') # Ex: "segunda-feira"
        self.hora_inicio = data.get('hora_inicio') # Ex: "09:00"
        self.hora_fim = data.get('hora_fim')     # Ex: "10:00"

    def to_dict(self):
        return {
            'id': str(self._id),
            'professor_id': self.professor_id,
            'dia_semana': self.dia_semana,
            'hora_inicio': self.hora_inicio,
            'hora_fim': self.hora_fim
        }

class Agendamento:
    """Representa uma aula agendada por um aluno."""
    def __init__(self, data):
        self._id = data.get('_id')
        # Armazenamos os IDs como referência a outras coleções
        self.aluno_id = str(data.get('aluno_id'))
        self.professor_id = str(data.get('professor_id'))
        self.tipo_aula_id = str(data.get('tipo_aula_id'))
        # Para datas, o ideal no MongoDB é usar o tipo datetime, mas strings funcionam
        self.data_agendamento = data.get('data_agendamento') # Ex: "2025-07-03T10:00:00Z"
        self.status = data.get('status', 'confirmado') # Ex: 'confirmado', 'cancelado'

    def to_dict(self):
        return {
            'id': str(self._id),
            'aluno_id': self.aluno_id,
            'professor_id': self.professor_id,
            'tipo_aula_id': self.tipo_aula_id,
            'data_agendamento': self.data_agendamento,
            'status': self.status
        }