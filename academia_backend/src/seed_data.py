"""
Script para popular o banco de dados com dados iniciais
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.academia import db, TipoAula, Professor, Aluno, Admin, Disponibilidade
from datetime import date, time, datetime, timedelta
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    return app

def seed_database():
    """Popula o banco com dados iniciais"""
    
    # Criar admin padrão
    admin = Admin(
        nome='Administrador',
        email='admin@academia.com'
    )
    admin.set_senha('admin123')
    db.session.add(admin)
    
    # Criar tipos de aula
    tipos_aula = [
        TipoAula(nome='Musculação', descricao='Treino com pesos e equipamentos'),
        TipoAula(nome='Yoga', descricao='Exercícios de flexibilidade e relaxamento'),
        TipoAula(nome='Boxe', descricao='Treino de boxe e condicionamento físico'),
        TipoAula(nome='Pilates', descricao='Exercícios de fortalecimento e postura'),
        TipoAula(nome='Zumba', descricao='Dança fitness com ritmos latinos'),
        TipoAula(nome='Crossfit', descricao='Treino funcional de alta intensidade')
    ]
    
    for tipo in tipos_aula:
        db.session.add(tipo)
    
    db.session.commit()  # Commit para obter os IDs
    
    # Criar professores
    professores = [
        Professor(nome='João Silva', email='joao@academia.com', telefone='(11) 99999-1111', especialidade='Musculação e Crossfit'),
        Professor(nome='Maria Santos', email='maria@academia.com', telefone='(11) 99999-2222', especialidade='Yoga e Pilates'),
        Professor(nome='Carlos Oliveira', email='carlos@academia.com', telefone='(11) 99999-3333', especialidade='Boxe'),
        Professor(nome='Ana Costa', email='ana@academia.com', telefone='(11) 99999-4444', especialidade='Zumba e Dança'),
        Professor(nome='Pedro Almeida', email='pedro@academia.com', telefone='(11) 99999-5555', especialidade='Pilates e Yoga')
    ]
    
    for professor in professores:
        db.session.add(professor)
    
    db.session.commit()  # Commit para obter os IDs
    
    # Associar professores aos tipos de aula
    # João - Musculação e Crossfit
    professores[0].tipos_aula.extend([tipos_aula[0], tipos_aula[5]])
    
    # Maria - Yoga e Pilates
    professores[1].tipos_aula.extend([tipos_aula[1], tipos_aula[3]])
    
    # Carlos - Boxe
    professores[2].tipos_aula.append(tipos_aula[2])
    
    # Ana - Zumba
    professores[3].tipos_aula.append(tipos_aula[4])
    
    # Pedro - Pilates e Yoga
    professores[4].tipos_aula.extend([tipos_aula[3], tipos_aula[1]])
    
    # Criar alguns alunos de exemplo
    alunos = [
        Aluno(nome='Lucas Ferreira', email='lucas@email.com', telefone='(11) 88888-1111'),
        Aluno(nome='Fernanda Lima', email='fernanda@email.com', telefone='(11) 88888-2222'),
        Aluno(nome='Roberto Souza', email='roberto@email.com', telefone='(11) 88888-3333'),
        Aluno(nome='Juliana Rocha', email='juliana@email.com', telefone='(11) 88888-4444')
    ]
    
    for aluno in alunos:
        aluno.set_senha('123456')  # Senha padrão para todos os alunos
        db.session.add(aluno)
    
    db.session.commit()  # Commit para obter os IDs
    
    # Criar disponibilidades para os próximos 7 dias
    hoje = date.today()
    
    for i in range(7):
        data_aula = hoje + timedelta(days=i)
        
        # Musculação - João - Manhã
        disp1 = Disponibilidade(
            data=data_aula,
            hora_inicio=time(8, 0),
            hora_fim=time(9, 0),
            vagas_total=10,
            tipo_aula_id=tipos_aula[0].id,
            professor_id=professores[0].id
        )
        db.session.add(disp1)
        
        # Yoga - Maria - Manhã
        disp2 = Disponibilidade(
            data=data_aula,
            hora_inicio=time(9, 30),
            hora_fim=time(10, 30),
            vagas_total=8,
            tipo_aula_id=tipos_aula[1].id,
            professor_id=professores[1].id
        )
        db.session.add(disp2)
        
        # Boxe - Carlos - Tarde
        disp3 = Disponibilidade(
            data=data_aula,
            hora_inicio=time(18, 0),
            hora_fim=time(19, 0),
            vagas_total=6,
            tipo_aula_id=tipos_aula[2].id,
            professor_id=professores[2].id
        )
        db.session.add(disp3)
        
        # Zumba - Ana - Noite
        disp4 = Disponibilidade(
            data=data_aula,
            hora_inicio=time(19, 30),
            hora_fim=time(20, 30),
            vagas_total=12,
            tipo_aula_id=tipos_aula[4].id,
            professor_id=professores[3].id
        )
        db.session.add(disp4)
        
        # Pilates - Pedro - Tarde
        disp5 = Disponibilidade(
            data=data_aula,
            hora_inicio=time(16, 0),
            hora_fim=time(17, 0),
            vagas_total=8,
            tipo_aula_id=tipos_aula[3].id,
            professor_id=professores[4].id
        )
        db.session.add(disp5)
    
    db.session.commit()
    print("Banco de dados populado com sucesso!")
    print("\nCredenciais de acesso:")
    print("Admin: admin@academia.com / admin123")
    print("Alunos: lucas@email.com, fernanda@email.com, roberto@email.com, juliana@email.com / 123456")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_database()

