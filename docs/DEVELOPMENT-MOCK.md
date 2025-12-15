# 🧪 Guia de Desenvolvimento com Dados Mockados

## 📋 Visão Geral

Este guia explica como usar o ambiente de desenvolvimento com dados mockados localmente, sem necessidade de conexão com a API real da AWS.

## 🎯 Quando Usar Mock vs API Real

### ✅ Use Dados Mockados (USE_MOCK_API=true) quando:

- Estiver desenvolvendo novas features
- Não tiver acesso à VPN/AWS
- Quiser trabalhar offline
- Precisar de dados consistentes para testes
- Estiver fazendo testes de interface

### 🌐 Use API Real (USE_MOCK_API=false) quando:

- Estiver testando integração com AWS
- Precisar validar upload de imagens
- Estiver em homologação/produção
- Precisar testar com dados reais

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar o arquivo .env e configurar:
USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:5555
```

### 2. Iniciar Ambiente de Desenvolvimento

#### Opção A: Usando Docker (Recomendado)

```bash
# Iniciar todos os serviços (app + mock-api)
docker-compose up

# Ou em background
docker-compose up -d
```

**URLs disponíveis:**

- Frontend: http://localhost:3000
- Mock API: http://localhost:5555
- API Dashboard: http://localhost:5555/\_\_admin

#### Opção B: Sem Docker (Local)

```bash
# Terminal 1: Iniciar mock API
cd mock-data
npx json-server --watch db.json --port 5555 --routes routes.json --delay 500

# Terminal 2: Iniciar aplicação Next.js
npm run dev
```

### 3. Alternando Entre Mock e API Real

Basta editar o arquivo `.env`:

```bash
# Para usar dados mockados
USE_MOCK_API=true
NEXT_PUBLIC_API_URL=http://localhost:5555

# Para usar API real
USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.portalpalhoca.com.br
```

**Importante:** Após alterar, reinicie a aplicação!

## 📊 Dados Mockados Disponíveis

O arquivo [mock-data/db.json](mock-data/db.json) contém dados realistas para:

### 📝 Artigos (Articles)

- 3 artigos de exemplo
- Status: PUBLISHED, DRAFT
- Com destaque e posições
- Categorias e tags associadas

### 👥 Usuários (Users)

- 4 usuários com diferentes roles
- Editor Chefe, Redatores, Designer
- Usuários ativos e inativos
- Com imagens de perfil

### 🏢 Comércios (Companies)

- 3 empresas de exemplo
- Farmácia, Restaurante, Academia
- Com endereços completos e geolocalização
- Logos e informações de contato

### 🎨 Banners

- 4 banners (3 ativos, 1 inativo)
- Estilos horizontal e vertical
- Datas de ativação e expiração
- Vinculados a empresas

### 📈 Relatórios (Analytics)

- Dados de visualizações e cliques
- Para artigos, banners e empresas
- Com datas e métricas

### Outros Dados

- **Categorias**: Saúde, Trânsito, Cultura
- **Tags**: 6 tags variadas
- **Portais**: Portal Palhoça
- **Roles**: 4 tipos de permissões

## 🔧 Endpoints Disponíveis

A mock API suporta todos os métodos REST:

```bash
# Listar todos
GET http://localhost:5555/api/articles
GET http://localhost:5555/api/users
GET http://localhost:5555/api/companies
GET http://localhost:5555/api/banners

# Buscar por ID
GET http://localhost:5555/api/articles/article-1
GET http://localhost:5555/api/users/user-1

# Criar novo
POST http://localhost:5555/api/articles
Content-Type: application/json
{
  "title": "Novo artigo",
  "content": "Conteúdo..."
}

# Atualizar
PUT http://localhost:5555/api/articles/article-1
PATCH http://localhost:5555/api/articles/article-1

# Deletar
DELETE http://localhost:5555/api/articles/article-1

# Filtros e Paginação
GET http://localhost:5555/api/articles?status=PUBLISHED
GET http://localhost:5555/api/users?isActive=true
GET http://localhost:5555/api/articles?_page=1&_limit=10
```

## 📝 Editando Dados Mockados

### Durante Desenvolvimento (Hot Reload)

Edite o arquivo [mock-data/db.json](mock-data/db.json) diretamente. As mudanças são refletidas automaticamente!

### Adicionando Novos Dados

```json
// Em mock-data/db.json, adicione ao array correspondente:
{
  "articles": [
    // ... artigos existentes
    {
      "id": "article-novo",
      "title": "Meu novo artigo",
      "slug": "meu-novo-artigo"
      // ... outros campos
    }
  ]
}
```

### Resetando Dados

Se quiser voltar aos dados originais, faça um commit ou mantenha um backup do db.json.

## 🐛 Troubleshooting

### Mock API não inicia

```bash
# Verificar se a porta 5555 está disponível
netstat -ano | findstr :5555

# Matar processo se necessário (Windows)
taskkill /PID <PID> /F

# Reconstruir container
docker-compose down
docker-compose up --build mock-api
```

### Aplicação não conecta à Mock API

1. Verifique se `USE_MOCK_API=true` no `.env`
2. Verifique se a URL está correta:
   - Docker: `http://mock-api:5555`
   - Local: `http://localhost:5555`
3. Reinicie a aplicação após mudar o `.env`

### Dados não aparecem

1. Acesse http://localhost:5555/api/articles diretamente no navegador
2. Verifique se o db.json está sendo carregado
3. Veja os logs do container: `docker-compose logs mock-api`

### Erro CORS

O json-server por padrão aceita requisições de qualquer origem. Se tiver problemas:

```bash
# Adicione headers customizados no mock-data/Dockerfile
# Já está configurado para aceitar todas as origens
```

## 💡 Dicas de Desenvolvimento

### 1. Testando Diferentes Cenários

Crie múltiplos arquivos de dados:

```bash
mock-data/
  ├── db.json          # Dados padrão
  ├── db.test.json     # Dados para testes
  └── db.empty.json    # Base vazia
```

Alterne entre eles no docker-compose.yml:

```yaml
volumes:
  - ./mock-data/db.test.json:/data/db.json # Usar dados de teste
```

### 2. Simulando Latência de Rede

O json-server já adiciona um delay de 500ms. Para ajustar:

```dockerfile
# Em mock-data/Dockerfile
CMD ["json-server", "--watch", "db.json", "--delay", "1000"]  # 1 segundo
```

### 3. Inspecionando Requisições

Veja os logs em tempo real:

```bash
docker-compose logs -f mock-api
```

### 4. Postman/Insomnia Collection

Use o endpoint base `http://localhost:5555/api/` para testar endpoints.

## 📚 Recursos Adicionais

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Como funcionam as rotas customizadas](https://github.com/typicode/json-server#add-custom-routes)
- [Filtros e queries avançadas](https://github.com/typicode/json-server#filter)

## 🔄 Fluxo de Trabalho Recomendado

1. **Desenvolvimento inicial**: Use mock API (rápido, offline)
2. **Teste de features**: Continue com mock API
3. **Teste de integração**: Alterne para API real
4. **Deploy**: Use API real em produção

## 🎨 Personalizando a Mock API

### Adicionando Novos Endpoints

Edite [mock-data/routes.json](mock-data/routes.json):

```json
{
  "/api/custom-endpoint": "/custom-endpoint"
}
```

### Adicionando Middleware

Crie um arquivo `mock-data/middleware.js` (avançado):

```javascript
module.exports = (req, res, next) => {
  // Log todas as requisições
  console.log(`${req.method} ${req.url}`);

  // Adicionar headers customizados
  res.header("X-Custom-Header", "My Value");

  next();
};
```

## 📞 Suporte

Problemas? Verifique:

1. ✅ Docker está rodando
2. ✅ Portas 3000 e 5555 estão livres
3. ✅ Arquivo .env está configurado
4. ✅ Containers estão em execução: `docker-compose ps`

---

**Bom desenvolvimento! 🚀**
