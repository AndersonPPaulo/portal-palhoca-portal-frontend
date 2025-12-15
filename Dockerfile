# Dockerfile para desenvolvimento
FROM node:20-alpine AS base

# Instalar dependências necessárias para algumas libs
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar o resto do código
COPY . .

# Expor a porta do Next.js
EXPOSE 3000

# Variável para ambiente de desenvolvimento
ENV NODE_ENV=development

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "run", "dev"]
