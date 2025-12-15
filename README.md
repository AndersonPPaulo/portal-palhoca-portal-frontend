# 📰 Portal Palhoça - Painel Administrativo

Painel administrativo para gerenciamento de conteúdo do Portal de Notícias de Palhoça/SC.

Sistema completo para gestão de artigos, usuários, comércios, banners e relatórios.

## 🚀 Início Rápido

### Ambiente de Desenvolvimento (Docker)

```bash
# 1. Clonar e entrar no projeto
cd portal-palhoca-painel-frontend

# 2. Copiar variáveis de ambiente (já configurado para mock)
cp .env.example .env

# 3. Iniciar ambiente completo
docker-compose up
```

**Pronto! 🎉**

- **Frontend**: http://localhost:3000
- **Mock API**: http://localhost:5555

📖 **[Guia Completo de Início Rápido →](./docs/QUICKSTART.md)**

### Sem Docker (Local)

```bash
# Terminal 1: Mock API
npm run mock:server

# Terminal 2: Next.js
npm run dev:mock
```

## 📚 Documentação

| Documento                                             | Descrição                                              |
| ----------------------------------------------------- | ------------------------------------------------------ |
| **[QUICKSTART.md](./docs/QUICKSTART.md)**             | ⚡ Início rápido com comandos essenciais               |
| **[DEVELOPMENT-MOCK.md](./docs/DEVELOPMENT-MOCK.md)** | 🧪 Guia completo de desenvolvimento com dados mockados |
| **[API-REFERENCE.md](./docs/API-REFERENCE.md)**       | 🔍 Referência completa dos endpoints da API            |
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**         | 🏗️ Arquitetura e diagramas do sistema                  |
| **[README.docker.md](./docs/README.docker.md)**       | 🐳 Guia completo do Docker                             |
| **[WINDOWS-GUIDE.md](./docs/WINDOWS-GUIDE.md)**       | 🪟 Guia específico para Windows                        |
| **[mock-data/README.md](./docs/mock-data/README.md)** | 🗄️ Documentação dos dados mockados                     |

## 🎯 Funcionalidades

### ✅ Implementado

- 📝 **Gestão de Artigos** - CRUD completo, editor rich text
- 👥 **Gestão de Usuários** - Permissões e roles
- 🏢 **Gestão de Comércios** - Cadastro com geolocalização
- 🎨 **Gestão de Banners** - Upload e agendamento
- 📊 **Relatórios e Analytics** - Visualizações e cliques
- 🏷️ **Categorias e Tags** - Organização de conteúdo
- 🌐 **Multi-portal** - Suporte a múltiplos portais

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **UI**: React 19 + Tailwind CSS
- **Componentes**: Radix UI + shadcn/ui
- **Editor**: TipTap (Rich Text)
- **Formulários**: React Hook Form + Zod
- **HTTP**: Axios + React Query
- **Mapas**: Leaflet + React Leaflet

## 🔧 Ambientes

### Desenvolvimento com Mock (Padrão)

```bash
# .env
USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:5555
```

✅ Usa dados mockados localmente  
✅ Não precisa de conexão com AWS  
✅ Ideal para desenvolvimento de features

### Desenvolvimento com API Real

```bash
# .env
USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br
```

✅ Conecta na API real (AWS)  
✅ Necessário para testes de integração  
✅ Requer credenciais AWS para uploads

## 📝 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Next.js (usa .env)
npm run dev:mock     # Next.js com mock forçado
npm run dev:real     # Next.js com API real forçada
npm run mock:server  # Apenas mock API local
```

### Docker

```bash
npm run docker:up       # Iniciar todos os serviços
npm run docker:up:d     # Iniciar em background
npm run docker:down     # Parar serviços
npm run docker:rebuild  # Reconstruir e iniciar
npm run docker:logs     # Ver logs
npm run docker:mock     # Apenas mock API
npm run docker:app      # Apenas aplicação
```

### Build e Deploy

```bash
npm run build    # Build de produção
npm run start    # Iniciar produção
npm run lint     # Verificar código
```

## 🗄️ Dados Mockados

O ambiente de desenvolvimento inclui dados realistas para:

- ✅ **3 Artigos** - Publicados e rascunhos
- ✅ **4 Usuários** - Diferentes roles e permissões
- ✅ **3 Empresas** - Com endereços e logos
- ✅ **4 Banners** - Ativos e inativos
- ✅ **Analytics** - Métricas e relatórios

📁 Localização: `mock-data/db.json`

## 🔄 Alternando Entre Mock e API Real

### Método 1: Editar .env

```bash
# Editar .env
USE_MOCK_API=true   # ou false

# Reiniciar
docker-compose restart app
```

### Método 2: Scripts npm

```bash
npm run dev:mock  # Forçar mock
npm run dev:real  # Forçar API real
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/              # Páginas e rotas (Next.js App Router)
├── components/       # Componentes React
├── providers/        # Contexts e providers
├── service/          # Configuração API
├── hooks/            # Custom hooks
├── lib/              # Utilitários
├── types/            # TypeScript types
└── utils/            # Funções auxiliares

mock-data/           # Dados mockados e JSON Server
```

## 🐳 Docker

### Containers

- **app** - Aplicação Next.js (porta 3000)
- **mock-api** - JSON Server (porta 5555)

### Volumes

- Código fonte montado para hot-reload
- `node_modules` em volume separado (performance)
- Dados mockados montados para edição

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Containers não iniciam

```bash
docker-compose down -v
docker-compose up --build
```

### Mock API não conecta

1. Verificar `.env`: `USE_MOCK_API=true`
2. Verificar URL correta no `.env`
3. Reiniciar containers

📖 **[Guia Completo de Troubleshooting →](./docs/DEVELOPMENT-MOCK.md#troubleshooting)**

## 📞 Suporte

Para mais informações, consulte a [documentação completa](./docs/QUICKSTART.md).

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit suas mudanças: `git commit -m 'Adiciona nova feature'`
3. Push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido por Plathanus Tech** 🚀

Para começar, veja o [Quick Start Guide](./docs/QUICKSTART.md)!
