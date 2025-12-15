# Dockerfile para o json-server (API Mock)
FROM node:20-alpine

WORKDIR /data

# Instalar dependências necessárias
RUN apk add --no-cache wget

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar json-server localmente
RUN npm install

# Copiar os dados mockados e servidor customizado
COPY db.json /data/db.json
COPY routes.json /data/routes.json
COPY server.js /data/server.js

# Expor porta do servidor
EXPOSE 5555

# Comando para iniciar o servidor customizado com suporte a login
CMD ["node", "server.js"]
