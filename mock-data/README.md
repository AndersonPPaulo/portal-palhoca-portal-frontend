# 📦 Mock Data - API de Desenvolvimento

Este diretório contém os dados mockados e a configuração do JSON Server para desenvolvimento local.

## 📁 Estrutura

```
mock-data/
├── db.json          # Banco de dados mockado
├── routes.json      # Rotas customizadas da API
├── Dockerfile       # Container do json-server
└── README.md        # Este arquivo
```

## 🗄️ Dados Disponíveis

O arquivo `db.json` contém:

- **3 Artigos** (articles) - Com status PUBLISHED e DRAFT
- **4 Usuários** (users) - Com diferentes roles e permissões
- **3 Empresas** (companies) - Farmácia, Restaurante e Academia
- **4 Banners** (banners) - 3 ativos e 1 inativo
- **3 Categorias** (categories) - Saúde, Trânsito, Cultura
- **6 Tags** (tags) - Tags variadas para os artigos
- **1 Portal** (portals) - Portal Palhoça
- **4 Roles** (roles) - Perfis de permissão
- **4 Analytics** (analytics) - Dados de métricas

## 🚀 Como Usar

### Com Docker (Recomendado)

O serviço já está configurado no `docker-compose.yml`:

```bash
docker-compose up mock-api
```

### Sem Docker

```bash
cd mock-data
npx json-server --watch db.json --port 5555 --routes routes.json --delay 500
```

## 🔧 Endpoints

Todos os endpoints estão prefixados com `/api/`:

- `GET /api/articles` - Listar artigos
- `GET /api/users` - Listar usuários
- `GET /api/companies` - Listar empresas
- `GET /api/banners` - Listar banners
- E mais...

Veja a [documentação completa de endpoints](../API-REFERENCE.md).

## ✏️ Editando Dados

### Durante Desenvolvimento

Basta editar o arquivo `db.json`. O json-server detecta automaticamente as mudanças e recarrega os dados.

### Adicionando Novos Registros

```json
{
  "articles": [
    {
      "id": "article-4",
      "title": "Meu novo artigo",
      "slug": "meu-novo-artigo",
      "status": "DRAFT",
      ...
    }
  ]
}
```

### IDs Automáticos

O json-server gera IDs automaticamente se você não especificar:

```bash
# POST sem ID - json-server cria automaticamente
curl -X POST http://localhost:5555/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title": "Novo", "status": "DRAFT"}'
```

## 🔍 Filtros e Queries

### Filtros Simples

```
/api/articles?status=PUBLISHED
/api/users?isActive=true
/api/banners?banner_style=horizontal
```

### Paginação

```
/api/articles?_page=1&_limit=10
```

### Ordenação

```
/api/articles?_sort=created_at&_order=desc
```

### Busca

```
/api/articles?q=saúde
/api/articles?title_like=Palhoça
```

### Operadores

```
/api/analytics?views_gte=1000  # Greater than or equal
/api/analytics?views_lte=5000  # Less than or equal
/api/users?isActive_ne=false   # Not equal
```

## 📝 Rotas Customizadas

O arquivo `routes.json` mapeia URLs customizadas:

```json
{
  "/api/articles": "/articles",
  "/api/users": "/users",
  ...
}
```

Isso permite manter compatibilidade com a API real.

## 🐛 Debug

### Ver todos os dados

```
http://localhost:5555/db
```

### Ver logs

```bash
docker-compose logs -f mock-api
```

### Testar endpoints

```bash
curl http://localhost:5555/api/articles
```

## ⚙️ Configuração

### Delay de Resposta

Simulação de latência (padrão: 500ms):

```dockerfile
# Em Dockerfile
CMD ["json-server", "--watch", "db.json", "--delay", "1000"]
```

### Porta

Para mudar a porta, edite o `Dockerfile`:

```dockerfile
EXPOSE 8080
CMD ["json-server", "--watch", "db.json", "--port", "8080"]
```

E atualize o `docker-compose.yml`:

```yaml
ports:
  - "8080:8080"
```

## 🔄 Reset de Dados

Para restaurar os dados originais, faça:

```bash
git checkout mock-data/db.json
```

Ou mantenha um backup:

```bash
cp db.json db.backup.json
```

## 📚 Documentação

- [JSON Server - GitHub](https://github.com/typicode/json-server)
- [Guia de Desenvolvimento](../DEVELOPMENT-MOCK.md)
- [Referência de API](../API-REFERENCE.md)

## 💡 Dicas

1. **Dados persistem**: Alterações via POST/PUT/DELETE são salvas no `db.json`
2. **Hot reload**: Mudanças no `db.json` são detectadas automaticamente
3. **Validação**: O json-server não valida schemas, aceita qualquer JSON válido
4. **CORS**: CORS está habilitado por padrão, aceita requisições de qualquer origem
5. **Headers**: json-server retorna headers adequados (Content-Type, etc.)

## 🎯 Próximos Passos

1. Explore os dados em `db.json`
2. Teste os endpoints em http://localhost:5555
3. Leia o [guia de desenvolvimento](../DEVELOPMENT-MOCK.md)
4. Consulte a [referência de API](../API-REFERENCE.md)

---

**Happy Mocking! 🚀**
