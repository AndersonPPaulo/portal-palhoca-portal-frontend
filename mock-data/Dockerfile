# Dockerfile para o json-server (API Mock)
FROM node:20-alpine

WORKDIR /data

# Instalar dependências necessárias e json-server
RUN apk add --no-cache wget && \
    npm install -g json-server@0.17.4

# Copiar os dados mockados
COPY db.json /data/db.json
COPY routes.json /data/routes.json

# Expor porta do json-server
EXPOSE 5555

# Comando para iniciar o json-server
# --watch: observa mudanças no db.json
# --host: permite acesso de qualquer host
# --port: porta do servidor
# --routes: arquivo de rotas customizadas
# --delay: adiciona delay nas respostas para simular API real
CMD ["json-server", "--watch", "db.json", "--host", "0.0.0.0", "--port", "5555", "--routes", "routes.json", "--delay", "500"]
