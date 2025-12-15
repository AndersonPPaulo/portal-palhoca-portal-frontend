# ⚡ Quick Start - Ambiente de Desenvolvimento Mock

## 🚀 Início Rápido (Docker)

```bash
# 1. Criar arquivo .env (já criado)
# cp .env.example .env

# 2. Iniciar tudo
docker-compose up

# Ou em background
docker-compose up -d
```

**Pronto! 🎉**

- Frontend: http://localhost:3000
- Mock API: http://localhost:5555

---

## 📝 Comandos Úteis

### Docker

```bash
# Iniciar todos os serviços
npm run docker:up

# Iniciar em background
npm run docker:up:d

# Parar serviços
npm run docker:down

# Reconstruir e iniciar
npm run docker:rebuild

# Ver logs
npm run docker:logs

# Apenas Mock API
npm run docker:mock

# Apenas App
npm run docker:app
```

### Desenvolvimento Local (sem Docker)

```bash
# Terminal 1: Mock API
npm run mock:server

# Terminal 2: Next.js com Mock
npm run dev:mock

# Ou com API Real
npm run dev:real
```

---

## 🔧 Alternando Ambientes

### Método 1: Via .env (Recomendado)

Edite o arquivo `.env`:

```bash
# Para Mock
USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:5555

# Para API Real
USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br
```

Depois reinicie: `docker-compose restart app`

### Método 2: Via Scripts npm

```bash
# Desenvolvimento com Mock
npm run dev:mock

# Desenvolvimento com API Real
npm run dev:real
```

---

## 📊 Testando a API Mock

```bash
# No navegador ou via curl
curl http://localhost:5555/api/articles
curl http://localhost:5555/api/users
curl http://localhost:5555/api/companies
curl http://localhost:5555/api/banners

# Ver todos os dados
curl http://localhost:5555/db

# Com filtros
curl "http://localhost:5555/api/articles?status=PUBLISHED"
curl "http://localhost:5555/api/users?isActive=true"
```

---

## 🐛 Troubleshooting Rápido

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5555
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5555 | xargs kill -9
```

### Containers não iniciam

```bash
# Parar tudo e reconstruir
docker-compose down -v
docker-compose up --build
```

### Mock API não conecta

1. Verifique `.env`: `USE_MOCK_API=true`
2. Verifique URL: `NEXT_PUBLIC_API_URL=http://mock-api:5555` (Docker) ou `http://localhost:5555` (Local)
3. Reinicie: `docker-compose restart`

### Ver logs de erro

```bash
# Logs do app
docker-compose logs -f app

# Logs da mock API
docker-compose logs -f mock-api

# Logs de tudo
docker-compose logs -f
```

---

## 📁 Arquivos Importantes

- **`.env`** - Configuração de ambiente
- **`mock-data/db.json`** - Dados mockados
- **`src/service/api.ts`** - Configuração da API
- **`docker-compose.yml`** - Orquestração Docker

---

## 📚 Documentação Completa

- [Guia Completo de Desenvolvimento](DEVELOPMENT-MOCK.md)
- [Referência de API](API-REFERENCE.md)
- [Mock Data README](mock-data/README.md)
- [Docker Guide](README.docker.md)

---

## 🎯 Próximos Passos

1. ✅ Ambiente está rodando
2. 📖 Leia [DEVELOPMENT-MOCK.md](DEVELOPMENT-MOCK.md) para entender o fluxo
3. 🔍 Explore os dados em [mock-data/db.json](mock-data/db.json)
4. 🧪 Teste os endpoints na [API-REFERENCE.md](API-REFERENCE.md)
5. 💻 Comece a desenvolver!

---

**Dúvidas?** Consulte a documentação completa ou os logs: `npm run docker:logs`

🚀 **Bom desenvolvimento!**
