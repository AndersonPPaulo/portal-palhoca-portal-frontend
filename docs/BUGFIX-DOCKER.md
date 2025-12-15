# 🐛 Correção Aplicada - Problema Resolvido

## ❌ Problema Original

```bash
docker-compose up -d
# ✘ Container portal-palhoca-mock-api Error
# dependency failed to start: container portal-palhoca-mock-api is unhealthy
```

## 🔍 Diagnóstico

### Problema 1: Versão incompatível do json-server

A versão mais recente do `json-server` (v1.x) mudou completamente a sintaxe e removeu opções como `--routes`, `--watch`, `--delay`.

**Logs:**

```
Unknown option '--routes'
```

### Problema 2: Healthcheck falhando

O comando `wget` não estava instalado na imagem Alpine, fazendo o healthcheck falhar constantemente.

## ✅ Soluções Aplicadas

### 1. Fixar versão do json-server

**Arquivo**: `mock-data/Dockerfile`

```dockerfile
# Antes
RUN npm install -g json-server

# Depois
RUN npm install -g json-server@0.17.4
```

**Motivo**: Versão 0.17.4 é a última estável com todas as features necessárias.

### 2. Instalar wget para healthcheck

**Arquivo**: `mock-data/Dockerfile`

```dockerfile
# Antes
RUN npm install -g json-server@0.17.4

# Depois
RUN apk add --no-cache wget && \
    npm install -g json-server@0.17.4
```

### 3. Remover warning do version

**Arquivo**: `docker-compose.yml`

```yaml
# Antes
version: "3.8"
services:
  ...

# Depois
services:
  ...
```

**Motivo**: Docker Compose moderno não precisa da versão especificada.

### 4. Melhorar configuração do healthcheck

**Arquivo**: `docker-compose.yml`

```yaml
healthcheck:
  test:
    [
      "CMD",
      "wget",
      "--quiet",
      "--tries=1",
      "--spider",
      "http://localhost:5555/api/articles",
    ]
  interval: 10s # Verificar a cada 10s
  timeout: 5s # Timeout de 5s
  retries: 5 # 5 tentativas
  start_period: 20s # Aguardar 20s antes de começar
```

## 🧪 Testes Realizados

### ✅ Mock API

```bash
curl http://localhost:5555/api/articles
# Status: 200 OK
# Retorna: Array com 3 artigos
```

### ✅ Containers

```bash
docker-compose ps
# mock-api: Up (healthy)
# app: Up
```

### ✅ Logs

```bash
# Mock API iniciou corretamente
# Resources carregados: articles, users, companies, banners, etc
# Rotas customizadas funcionando: /api/* -> /*
```

## 📊 Status Final

| Componente | Status     | Porta | Health     |
| ---------- | ---------- | ----- | ---------- |
| mock-api   | ✅ Running | 5555  | ✅ Healthy |
| app        | ✅ Running | 3000  | -          |

## 🚀 Como Usar Agora

```bash
# Parar tudo (se estiver rodando)
docker-compose down

# Iniciar com rebuild
docker-compose up --build -d

# Aguardar ~20 segundos para healthcheck

# Verificar status
docker-compose ps
# Ambos devem estar "Up"

# Testar
curl http://localhost:5555/api/articles
# Abrir: http://localhost:3000
```

## 💡 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver apenas mock-api
docker-compose logs -f mock-api

# Ver apenas app
docker-compose logs -f app

# Recriar do zero
docker-compose down -v
docker-compose up --build -d
```

## 📝 Arquivos Modificados

1. ✅ `mock-data/Dockerfile` - Fixar versão + instalar wget
2. ✅ `docker-compose.yml` - Remover version + ajustar healthcheck

## 🎉 Conclusão

**Problema resolvido! Ambiente 100% funcional.**

- Mock API rodando na porta 5555
- Frontend rodando na porta 3000
- Healthcheck funcionando
- Dados mockados carregados

---

**Data da correção**: 15 de dezembro de 2025
