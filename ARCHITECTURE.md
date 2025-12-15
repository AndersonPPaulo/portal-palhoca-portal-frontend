# 🏗️ Arquitetura do Ambiente de Desenvolvimento

## 📐 Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOCKER COMPOSE                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Network: portal-network                │  │
│  │                                                            │  │
│  │  ┌─────────────────────┐      ┌──────────────────────┐   │  │
│  │  │   Mock API          │      │   Next.js App        │   │  │
│  │  │   (json-server)     │      │   (Frontend)         │   │  │
│  │  │                     │      │                      │   │  │
│  │  │  Container:         │◄─────┤  Container:          │   │  │
│  │  │  mock-api           │      │  app                 │   │  │
│  │  │                     │      │                      │   │  │
│  │  │  Port: 5555         │      │  Port: 3000          │   │  │
│  │  │                     │      │                      │   │  │
│  │  │  Volume:            │      │  Volumes:            │   │  │
│  │  │  ./mock-data/       │      │  ./                  │   │  │
│  │  │    db.json          │      │  ./node_modules      │   │  │
│  │  │    routes.json      │      │  ./.next             │   │  │
│  │  │                     │      │                      │   │  │
│  │  └─────────────────────┘      └──────────────────────┘   │  │
│  │           │                             │                 │  │
│  └───────────┼─────────────────────────────┼─────────────────┘  │
└──────────────┼─────────────────────────────┼────────────────────┘
               │                             │
               │                             │
       ┌───────▼────────┐            ┌───────▼────────┐
       │  localhost:5555 │            │  localhost:3000 │
       │  (Mock API)     │            │  (Frontend)     │
       └─────────────────┘            └─────────────────┘
               │                             │
               │                             │
               └─────────────┬───────────────┘
                             │
                      ┌──────▼───────┐
                      │   Navegador  │
                      │   (Browser)  │
                      └──────────────┘
```

## 🔄 Fluxo de Dados

### Modo Mock (Desenvolvimento)

```
┌──────────┐     HTTP Request      ┌──────────────┐
│          │────GET /api/articles──►│              │
│ Frontend │                        │  JSON Server │
│  (3000)  │◄───JSON Response───────│   (5555)     │
│          │                        │              │
└──────────┘                        └──────────────┘
     │                                     │
     │                                     │
     ▼                                     ▼
  React                              db.json
  Components                        (Mock Data)
```

### Modo Produção (API Real)

```
┌──────────┐     HTTP Request      ┌──────────────┐
│          │────GET /api/articles──►│              │
│ Frontend │                        │  AWS API     │
│  (3000)  │◄───JSON Response───────│  (Real DB)   │
│          │                        │              │
└──────────┘                        └──────────────┘
     │                                     │
     │                                     │
     ▼                                     ▼
  React                               PostgreSQL
  Components                           + S3 (AWS)
```

## ⚙️ Configuração via Variáveis de Ambiente

```
┌─────────────┐
│   .env      │
│             │
│ USE_MOCK=   │──┐
│   true      │  │
│             │  │
└─────────────┘  │
                 │
                 ▼
         ┌───────────────┐
         │  api.ts       │
         │               │
         │  if mock:     │
         │    → :5555    │
         │  else:        │
         │    → AWS API  │
         └───────────────┘
```

## 📂 Estrutura de Arquivos

```
portal-palhoca-painel-frontend/
│
├── 🐳 Docker
│   ├── Dockerfile                   # Container Next.js (Dev)
│   ├── Dockerfile.prod              # Container Next.js (Prod)
│   └── docker-compose.yml           # Orquestração
│
├── 🗄️ Mock Data
│   └── mock-data/
│       ├── db.json                  # Dados mockados
│       ├── routes.json              # Rotas da API
│       ├── Dockerfile               # Container JSON Server
│       └── README.md                # Docs do mock
│
├── ⚙️ Configuração
│   ├── .env                         # Variáveis de ambiente
│   ├── .env.example                 # Template
│   ├── .dockerignore                # Ignorar no build Docker
│   └── package.json                 # Scripts npm
│
├── 📝 Código Fonte
│   └── src/
│       ├── service/
│       │   └── api.ts               # ⚡ Configuração API (Mock/Real)
│       ├── providers/               # Contexts
│       ├── components/              # Componentes React
│       └── app/                     # Páginas Next.js
│
└── 📚 Documentação
    ├── QUICKSTART.md                # Início rápido
    ├── DEVELOPMENT-MOCK.md          # Guia completo mock
    ├── API-REFERENCE.md             # Referência endpoints
    ├── WINDOWS-GUIDE.md             # Guia Windows
    └── README.docker.md             # Guia Docker
```

## 🔀 Estados do Sistema

### Estado 1: Desenvolvimento com Mock (Padrão)

```
✅ USE_MOCK_API=true
✅ NEXT_PUBLIC_API_URL=http://mock-api:5555
✅ Containers: app + mock-api
✅ Dados: mock-data/db.json
❌ AWS: Não conecta
```

**Uso:** Desenvolvimento de features, testes de UI, trabalho offline

### Estado 2: Desenvolvimento com API Real

```
✅ USE_MOCK_API=false
✅ NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br
✅ Container: apenas app
✅ Dados: AWS (PostgreSQL + S3)
✅ AWS: Conecta
```

**Uso:** Teste de integração, validação de uploads, homologação

### Estado 3: Produção

```
✅ USE_MOCK_API=false
✅ NODE_ENV=production
✅ Build otimizado (Dockerfile.prod)
✅ AWS: Conecta
❌ Mock: Desativado
```

**Uso:** Deploy em produção

## 🌊 Fluxo de Desenvolvimento

```
1. Criar Feature
   │
   ├─► Usar Mock API
   │   └─► Desenvolvimento rápido
   │
2. Testar Localmente
   │
   ├─► Dados consistentes
   │   └─► Sem dependências externas
   │
3. Teste de Integração
   │
   ├─► Alternar para API Real
   │   └─► Validar uploads, AWS, etc
   │
4. Deploy
   │
   └─► Build de Produção
       └─► API Real em produção
```

## 🔐 Segurança e Isolamento

```
Ambiente Local (Sua máquina)
┌─────────────────────────────────────┐
│  Docker Network (Isolado)           │
│  ┌────────────┐  ┌────────────┐    │
│  │ Mock API   │  │  Next.js   │    │
│  │ (Interno)  │  │  (Público) │    │
│  └────────────┘  └────────────┘    │
│        │              │             │
│  Apenas comunicação                 │
│  interna entre                      │
│  containers                         │
└─────────────────────────────────────┘
        │
        ▼
   localhost
   (Exposto)
```

**Benefícios:**

- ✅ Mock API não é acessível externamente
- ✅ Comunicação interna via rede Docker
- ✅ Segurança de dados mockados
- ✅ Isolamento de ambientes

## 📊 Performance

### Tempo de Resposta

```
Mock API:
┌────────────────┐
│ Request        │─► ~500ms (simulado)
│ Processing     │
│ Response       │
└────────────────┘
   Consistente, previsível

API Real (AWS):
┌────────────────┐
│ Request        │─► ~200-2000ms (variável)
│ Network        │   Depende de:
│ DB Query       │   - Latência rede
│ Response       │   - Carga do servidor
└────────────────┘   - Complexidade query
```

### Recursos

```
Mock API Container:
├─ CPU: ~0.1-0.5%
├─ RAM: ~50-100MB
└─ Disco: ~5MB

Next.js Container:
├─ CPU: ~5-20%
├─ RAM: ~200-500MB
└─ Disco: ~500MB
```

## 🎯 Casos de Uso

| Cenário                  | Mock API | API Real |
| ------------------------ | -------- | -------- |
| 🔨 Desenvolvimento de UI | ✅ Sim   | ❌ Não   |
| 🧪 Testes unitários      | ✅ Sim   | ❌ Não   |
| 📱 Demo/Apresentação     | ✅ Sim   | ❌ Não   |
| 🌐 Trabalho offline      | ✅ Sim   | ❌ Não   |
| 📸 Upload de imagens     | ❌ Não   | ✅ Sim   |
| 🔄 Integração AWS        | ❌ Não   | ✅ Sim   |
| 🚀 Homologação           | ❌ Não   | ✅ Sim   |
| 🏭 Produção              | ❌ Não   | ✅ Sim   |

---

## 🎨 Legenda

- 🐳 Docker
- ⚙️ Configuração
- 📝 Código
- 🗄️ Dados
- 📚 Documentação
- ✅ Ativo/Sim
- ❌ Inativo/Não
- ◄─► Comunicação
- │ Fluxo
- ▼ Para baixo
