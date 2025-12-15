# 🔍 API Mock - Referência Rápida de Endpoints

## Base URL

- **Docker**: `http://mock-api:5555`
- **Local**: `http://localhost:5555`

---

## 📝 Articles (Artigos)

### Listar artigos

```http
GET /api/articles
GET /api/articles?status=PUBLISHED
GET /api/articles?highlight=true
GET /api/articles?_page=1&_limit=10
```

### Buscar artigo

```http
GET /api/articles/article-1
```

### Criar artigo

```http
POST /api/articles
Content-Type: application/json

{
  "title": "Título do artigo",
  "slug": "titulo-do-artigo",
  "content": "<p>Conteúdo HTML</p>",
  "status": "DRAFT",
  "categoryId": "cat-1"
}
```

### Atualizar artigo

```http
PUT /api/articles/article-1
PATCH /api/articles/article-1
```

### Deletar artigo

```http
DELETE /api/articles/article-1
```

---

## 👥 Users (Usuários)

### Listar usuários

```http
GET /api/users
GET /api/users?isActive=true
GET /api/users?role.name=Redator
```

### Buscar usuário

```http
GET /api/users/user-1
```

### Criar usuário

```http
POST /api/users
Content-Type: application/json

{
  "name": "Nome do usuário",
  "email": "usuario@email.com",
  "roleId": "role-2"
}
```

---

## 🏢 Companies (Comércios)

### Listar empresas

```http
GET /api/companies
GET /api/companies?isActive=true
GET /api/companies?category.name=Gastronomia
```

### Buscar empresa

```http
GET /api/companies/company-1
```

### Criar empresa

```http
POST /api/companies
Content-Type: application/json

{
  "name": "Nome da Empresa",
  "cnpj": "12.345.678/0001-00",
  "email": "contato@empresa.com.br"
}
```

---

## 🎨 Banners

### Listar banners

```http
GET /api/banners
GET /api/banners?status=true
GET /api/banners?banner_style=horizontal
```

### Buscar banner

```http
GET /api/banners/banner-1
```

### Criar banner

```http
POST /api/banners
Content-Type: application/json

{
  "name": "Nome do Banner",
  "link_direction": "https://exemplo.com",
  "status": true,
  "company_id": "company-1"
}
```

---

## 📊 Analytics (Relatórios)

### Listar analytics

```http
GET /api/analytics
GET /api/analytics?type=article
GET /api/analytics?entityId=article-1
GET /api/analytics?date=2024-12-01
```

---

## 🏷️ Categories (Categorias)

### Listar categorias

```http
GET /api/categories
```

### Buscar categoria

```http
GET /api/categories/cat-1
```

---

## 🔖 Tags

### Listar tags

```http
GET /api/tags
```

### Buscar tag

```http
GET /api/tags/tag-1
```

---

## 🌐 Portals (Portais)

### Listar portais

```http
GET /api/portals
GET /api/portals?status=true
```

### Buscar portal

```http
GET /api/portals/portal-1
```

---

## 👤 Roles (Permissões)

### Listar roles

```http
GET /api/roles
GET /api/roles?isDefault=true
```

### Buscar role

```http
GET /api/roles/role-1
```

---

## 🔍 Filtros Disponíveis

### Operadores de Comparação

```http
# Igual
GET /api/articles?status=PUBLISHED

# Greater than / Less than
GET /api/analytics?views_gte=1000
GET /api/analytics?views_lte=5000

# Not equal
GET /api/users?isActive_ne=false

# Like (busca parcial)
GET /api/articles?title_like=Palhoça
```

### Paginação

```http
GET /api/articles?_page=1&_limit=10
GET /api/articles?_start=0&_end=20
```

### Ordenação

```http
# Ascendente
GET /api/articles?_sort=created_at&_order=asc

# Descendente
GET /api/articles?_sort=created_at&_order=desc

# Múltiplos campos
GET /api/articles?_sort=status,created_at&_order=desc,asc
```

### Busca em Campos Aninhados

```http
GET /api/articles?category.name=Saúde
GET /api/users?role.name=Redator
GET /api/companies?category.name=Gastronomia
```

### Busca Full-Text

```http
GET /api/articles?q=saúde
```

### Slice (fatiar array)

```http
GET /api/articles?_start=20&_end=30
GET /api/articles?_start=0&_limit=10
```

### Relacionamentos

```http
# Expandir relacionamentos (embed)
GET /api/articles?_embed=comments

# Incluir relacionamentos (expand)
GET /api/articles?_expand=category
```

---

## 📝 Exemplos Completos

### Listar artigos publicados com destaque, ordenados por data

```http
GET /api/articles?status=PUBLISHED&highlight=true&_sort=created_at&_order=desc
```

### Buscar usuários ativos que são redatores

```http
GET /api/users?isActive=true&role.name=Redator
```

### Pegar banners ativos do estilo horizontal

```http
GET /api/banners?status=true&banner_style=horizontal
```

### Analytics de artigos com mais de 1000 visualizações

```http
GET /api/analytics?type=article&views_gte=1000&_sort=views&_order=desc
```

### Buscar artigos por termo no título

```http
GET /api/articles?title_like=Palhoça
```

### Paginação de usuários (página 2, 10 por página)

```http
GET /api/users?_page=2&_limit=10
```

---

## 🧪 Testando com cURL

```bash
# GET - Listar artigos
curl http://localhost:5555/api/articles

# GET com filtros
curl "http://localhost:5555/api/articles?status=PUBLISHED&_limit=5"

# POST - Criar artigo
curl -X POST http://localhost:5555/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Artigo",
    "slug": "novo-artigo",
    "status": "DRAFT"
  }'

# PUT - Atualizar artigo
curl -X PUT http://localhost:5555/api/articles/article-1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Atualizado"
  }'

# DELETE - Deletar artigo
curl -X DELETE http://localhost:5555/api/articles/article-1
```

---

## 💡 Dicas

1. **Teste no navegador**: Acesse `http://localhost:5555/api/articles` diretamente
2. **Use Postman/Insomnia**: Importe a collection com os endpoints
3. **Veja os dados**: Acesse `http://localhost:5555/db` para ver todo o banco
4. **Console de logs**: Use `docker-compose logs -f mock-api` para debug

---

## 📚 Documentação Oficial

Para filtros avançados e recursos adicionais, consulte:

- [JSON Server - GitHub](https://github.com/typicode/json-server)
- [Routes Documentation](https://github.com/typicode/json-server#routes)
