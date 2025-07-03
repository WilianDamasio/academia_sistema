# ---- Estágio de Construção ----

# Passo 1: Imagem Base
# Começamos com uma imagem oficial do Python. A versão 'slim' é mais leve.
FROM python:3.11-slim

# Passo 2: Diretório de Trabalho
# Define o diretório padrão dentro do contêiner. Todos os comandos seguintes
# serão executados a partir deste local.
WORKDIR /usr/src/app

# Passo 3: Otimização de Cache para Dependências
# Copia apenas o arquivo de dependências primeiro. O Docker salva o resultado
# desta camada em cache. Ele só reinstalará as dependências se este arquivo mudar.
COPY requirements.txt .

# Passo 4: Instalação das Dependências
# Instala todas as bibliotecas Python listadas no requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

# Passo 5: Copiar o Código da Aplicação
# Com as dependências já instaladas, copia todo o código-fonte
# da sua aplicação para o diretório de trabalho no contêiner.
COPY . .

# Passo 6: Expor a Porta
# Informa ao Docker que a aplicação dentro deste contêiner irá escutar
# na porta 8000. Isso não publica a porta, apenas a documenta.
EXPOSE 8000

# Passo 7: Comando de Execução
# Define o comando que será executado quando o contêiner iniciar.
# - "uvicorn": O servidor ASGI que roda o FastAPI.
# - "main:app": Diz ao Uvicorn para procurar o objeto 'app' no arquivo 'main.py'.
# - "--host 0.0.0.0": Faz o servidor escutar em todas as interfaces de rede
#   dentro do contêiner, o que é essencial para que o Docker possa mapear a porta.
# - "--port 8000": Roda o servidor na porta que definimos anteriormente.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "src.main:app"]