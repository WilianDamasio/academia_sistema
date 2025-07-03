# /usr/src/app/src/main.py

import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS

# Importa os blueprints. O ciclo de importação foi quebrado
# porque eles agora importam 'db' de 'database.py'.
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.aluno import aluno_bp

# Cria a instância da aplicação Flask
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'academia_secret_key_2024'

# Habilita CORS
CORS(app, supports_credentials=True)

# Registra os blueprints com os seus respectivos prefixos
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(aluno_bp, url_prefix='/api/aluno')

# Rota para servir o frontend (código inalterado)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Ponto de entrada para rodar a aplicação
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)