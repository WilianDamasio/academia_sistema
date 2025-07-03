"""
Script para criar um aluno de teste
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.academia import db, Aluno
from main import app

def create_test_aluno():
    with app.app_context():
        # Verificar se o aluno já existe
        existing_aluno = Aluno.query.filter_by(email='aluno@teste.com').first()
        if existing_aluno:
            print("Aluno de teste já existe!")
            print(f"Email: {existing_aluno.email}")
            return
        
        # Criar novo aluno
        aluno = Aluno(
            nome='João Silva',
            email='aluno@teste.com'
        )
        aluno.set_senha('123456')
        
        db.session.add(aluno)
        db.session.commit()
        
        print("Aluno de teste criado com sucesso!")
        print(f"Email: {aluno.email}")
        print(f"Senha: 123456")

if __name__ == '__main__':
    create_test_aluno()

