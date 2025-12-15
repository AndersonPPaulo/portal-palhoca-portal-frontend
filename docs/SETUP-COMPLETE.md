# ✅ Ambiente de Desenvolvimento Mockado - Configuração Completa

## 🎉 O que foi Configurado

### 1. ✅ Estrutura de Dados Mockados

- **Criado**: `mock-data/db.json` com dados realistas
  - 3 Artigos (PUBLISHED e DRAFT)
  - 4 Usuários (diferentes roles)
  - 3 Empresas (com endereços completos)
  - 4 Banners (ativos e inativos)
  - Categorias, Tags, Portais, Roles, Analytics

### 2. ✅ JSON Server (Mock API)

- **Criado**: `mock-data/Dockerfile` - Container do json-server
- **Criado**: `mock-data/routes.json` - Rotas customizadas `/api/*`
- **Configurado**: Delay de 500ms para simular latência real
- **Porta**: 5555

### 3. ✅ Docker Compose

- **Atualizado**: `docker-compose.yml` com 2 serviços:
  - `mock-api` - JSON Server (5555)
  - `app` - Next.js (3000)
- **Configurado**: Network interna para comunicação
- **Configurado**: Healthcheck no mock-api
- **Configurado**: Volumes para hot-reload

### 4. ✅ Configuração da API

- **Modificado**: `src/service/api.ts`
  - Lê variável `USE_MOCK_API`
  - Alterna automaticamente entre mock e API real
  - Logs de debug em desenvolvimento

### 5. ✅ Variáveis de Ambiente

- **Criado**: `.env` com configuração padrão (mock)
- **Atualizado**: `.env.example` com documentação completa
- **Variáveis principais**:
  - `USE_MOCK_API=true` (usar mock)
  - `NEXT_PUBLIC_API_URL=http://mock-api:5555`

### 6. ✅ Scripts NPM

- **Adicionado**: `npm run dev:mock` - Forçar mock
- **Adicionado**: `npm run dev:real` - Forçar API real
- **Adicionado**: `npm run mock:server` - Rodar mock local
- **Adicionado**: Scripts Docker (`docker:up`, `docker:down`, etc)

### 7. ✅ Documentação Completa

- **Criado**: `QUICKSTART.md` - Início rápido
- **Criado**: `DEVELOPMENT-MOCK.md` - Guia completo (11 seções)
- **Criado**: `API-REFERENCE.md` - Referência de endpoints
- **Criado**: `ARCHITECTURE.md` - Diagramas e arquitetura
- **Criado**: `WINDOWS-GUIDE.md` - Guia específico Windows
- **Criado**: `mock-data/README.md` - Docs dos dados mock
- **Atualizado**: `README.md` principal com links

## 🚀 Como Usar Agora

### Opção 1: Docker (Recomendado)

```bash
# Iniciar tudo
docker-compose up

# Acessar
# Frontend: http://localhost:3000
# Mock API: http://localhost:5555
```

### Opção 2: Local (Sem Docker)

```bash
# Terminal 1
npm run mock:server

# Terminal 2
npm run dev:mock
```

## 🔄 Alternar Entre Mock e API Real

### Via .env (Recomendado)

Editar `.env`:

```env
# Mock
USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:5555

# API Real
USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br
```

Depois: `docker-compose restart app`

### Via Scripts

```bash
npm run dev:mock  # Mock
npm run dev:real  # API Real
```

## 📊 Endpoints Disponíveis

Todos com prefixo `/api/`:

```
GET /api/articles        # Listar artigos
GET /api/users           # Listar usuários
GET /api/companies       # Listar empresas
GET /api/banners         # Listar banners
GET /api/categories      # Listar categorias
GET /api/tags            # Listar tags
GET /api/portals         # Listar portais
GET /api/roles           # Listar roles
GET /api/analytics       # Listar analytics
```

Suporta:

- ✅ GET, POST, PUT, PATCH, DELETE
- ✅ Filtros (`?status=PUBLISHED`)
- ✅ Paginação (`?_page=1&_limit=10`)
- ✅ Ordenação (`?_sort=created_at&_order=desc`)
- ✅ Busca (`?q=termo`)

## 📁 Arquivos Importantes

```
✅ docker-compose.yml           # Orquestração Docker
✅ .env                          # Variáveis de ambiente
✅ src/service/api.ts            # Config API (mock/real)
✅ mock-data/db.json             # Dados mockados
✅ mock-data/routes.json         # Rotas da API
✅ mock-data/Dockerfile          # Container JSON Server
✅ package.json                  # Scripts npm
```

## 🎯 Casos de Uso

| Situação              | Usar Mock? | Usar API Real? |
| --------------------- | ---------- | -------------- |
| Desenvolvimento de UI | ✅ Sim     | ❌ Não         |
| Teste de features     | ✅ Sim     | ❌ Não         |
| Trabalho offline      | ✅ Sim     | ❌ Não         |
| Demo/Apresentação     | ✅ Sim     | ❌ Não         |
| Upload de imagens     | ❌ Não     | ✅ Sim         |
| Integração AWS        | ❌ Não     | ✅ Sim         |
| Homologação           | ❌ Não     | ✅ Sim         |
| Produção              | ❌ Não     | ✅ Sim         |

## 💡 Dicas Importantes

### 1. Editando Dados Mock

Edite `mock-data/db.json` diretamente. O json-server recarrega automaticamente!

### 2. Testando Endpoints

```bash
# No navegador
http://localhost:5555/api/articles

# Com curl
curl http://localhost:5555/api/articles
```

### 3. Ver Logs

```bash
docker-compose logs -f mock-api  # Logs do mock
docker-compose logs -f app       # Logs do app
```

### 4. Resetar Dados

```bash
git checkout mock-data/db.json
```

## 🐛 Troubleshooting Rápido

### Porta ocupada

```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5555
taskkill /PID <PID> /F
```

### Container não inicia

```bash
docker-compose down -v
docker-compose up --build
```

### Mock não conecta

1. Verificar `.env`: `USE_MOCK_API=true`
2. Verificar URL: `http://mock-api:5555` (Docker) ou `http://localhost:5555` (local)
3. Reiniciar: `docker-compose restart`

## 📖 Documentação

Para informações detalhadas:

1. **Começar**: [QUICKSTART.md](QUICKSTART.md)
2. **Guia Completo**: [DEVELOPMENT-MOCK.md](DEVELOPMENT-MOCK.md)
3. **Endpoints**: [API-REFERENCE.md](API-REFERENCE.md)
4. **Arquitetura**: [ARCHITECTURE.md](ARCHITECTURE.md)
5. **Windows**: [WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)

## ✨ Benefícios Conquistados

✅ **Desenvolvimento Offline** - Não precisa de VPN/AWS  
✅ **Dados Consistentes** - Sempre os mesmos dados para testes  
✅ **Desenvolvimento Rápido** - Sem latência de rede  
✅ **Fácil Onboarding** - Novo dev pode começar em minutos  
✅ **Isolado** - Não afeta dados de produção  
✅ **Documentado** - Tudo bem explicado  
✅ **Flexível** - Alterna facilmente entre mock e real

## 🎓 Próximos Passos

1. ✅ Ambiente configurado
2. 📖 Ler o [QUICKSTART.md](QUICKSTART.md)
3. 🧪 Testar endpoints em http://localhost:5555
4. 💻 Começar a desenvolver!
5. 🔄 Alternar para API real quando necessário

## 🎉 Parabéns!

Seu ambiente de desenvolvimento mockado está **100% funcional**!

Execute `docker-compose up` e comece a desenvolver! 🚀

---

**Dúvidas?** Consulte a documentação ou os logs: `docker-compose logs -f`
