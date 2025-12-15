# 🐳 Guia Docker - Portal Palhoça Painel

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

## 🚀 Iniciando o Ambiente de Desenvolvimento

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 2. Iniciar os Containers

```bash
# Construir e iniciar os containers
docker-compose up -d

# Ou para ver os logs em tempo real
docker-compose up
```

A aplicação estará disponível em: `http://localhost:3000`

### 3. Comandos Úteis

```bash
# Ver logs
docker-compose logs -f app

# Parar os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir containers após mudanças no Dockerfile
docker-compose up --build

# Acessar o terminal do container
docker-compose exec app sh

# Instalar nova dependência
docker-compose exec app npm install nome-pacote

# Rodar comandos npm
docker-compose exec app npm run build
```

## 🔧 Desenvolvimento

### Hot Reload

O código está montado como volume, então qualquer alteração nos arquivos será refletida automaticamente.

### Instalar Dependências

Quando adicionar novas dependências ao `package.json`:

```bash
# Opção 1: Reconstruir o container
docker-compose up --build

# Opção 2: Instalar dentro do container
docker-compose exec app npm install
```

## 🏭 Build para Produção

Para criar uma imagem otimizada para produção:

```bash
# Construir imagem de produção
docker build -f Dockerfile.prod -t portal-palhoca-painel:prod .

# Executar container de produção
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br \
  portal-palhoca-painel:prod
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs app

# Reconstruir do zero
docker-compose down -v
docker-compose up --build
```

### Problemas com node_modules

```bash
# Remover volumes e reconstruir
docker-compose down -v
docker-compose up --build
```

### Porta 3000 já em uso

Edite o `docker-compose.yml` e altere a porta:

```yaml
ports:
  - "3001:3000" # Usar porta 3001 no host
```

## 📝 Notas

- O ambiente de desenvolvimento usa volumes para hot-reload
- As dependências são instaladas dentro do container
- Para produção, use `Dockerfile.prod` com build otimizado
- Certifique-se de configurar as credenciais AWS no `.env` se necessário

## 🔐 Segurança

**IMPORTANTE**: Nunca commite o arquivo `.env` com credenciais reais!

Sempre use `.env.example` como template e mantenha `.env` no `.gitignore`.
