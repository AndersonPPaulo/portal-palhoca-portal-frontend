# 🪟 Guia Específico para Windows

## PowerShell vs CMD

Os scripts em `package.json` usam sintaxe do CMD (`set`). Se estiver usando PowerShell, use `$env:` ao invés de `set`:

### CMD (Command Prompt)

```cmd
set USE_MOCK_API=true && set NEXT_PUBLIC_API_URL=http://localhost:5555 && npm run dev
```

### PowerShell

```powershell
$env:USE_MOCK_API="true"; $env:NEXT_PUBLIC_API_URL="http://localhost:5555"; npm run dev
```

## 🚀 Início Rápido no Windows

### 1. Pré-requisitos

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org/)
- [Git for Windows](https://git-scm.com/download/win)

### 2. Instalar Docker Desktop

```powershell
# Após instalar, verifique
docker --version
docker-compose --version
```

### 3. Clonar e Configurar

```powershell
# Já estamos no projeto

# Criar arquivo .env (se ainda não existe)
Copy-Item .env.example .env

# Instalar dependências (opcional, o Docker faz isso)
npm install
```

### 4. Iniciar Ambiente

```powershell
# Iniciar com Docker
docker-compose up

# Ou em background
docker-compose up -d
```

## 📝 Scripts PowerShell Customizados

Crie arquivos `.ps1` para facilitar:

### `start-dev-mock.ps1`

```powershell
# Inicia ambiente de desenvolvimento com mock
$env:USE_MOCK_API="true"
$env:NEXT_PUBLIC_API_URL="http://localhost:5555"
npm run dev
```

### `start-dev-real.ps1`

```powershell
# Inicia ambiente de desenvolvimento com API real
$env:USE_MOCK_API="false"
$env:NEXT_PUBLIC_API_URL="https://api.portalpalhoca.com.br"
npm run dev
```

### Executar:

```powershell
# Permitir execução de scripts (uma vez, como Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Executar
.\start-dev-mock.ps1
```

## 🐋 Docker no Windows

### Configurações Recomendadas

1. **WSL 2 Backend** (Recomendado)

   - Mais rápido e eficiente
   - Settings → General → Use WSL 2 based engine

2. **Recursos**

   - Settings → Resources
   - CPUs: 4+
   - Memory: 4GB+

3. **File Sharing**
   - Settings → Resources → File Sharing
   - Adicione o drive do projeto (ex: `C:\`)

### Verificar Docker está rodando

```powershell
# Ver status
docker ps

# Ver serviços do projeto
docker-compose ps
```

## 🔧 Comandos Úteis Windows

### Verificar Portas

```powershell
# Ver o que está usando a porta 3000
netstat -ano | findstr :3000

# Ver o que está usando a porta 5555
netstat -ano | findstr :5555
```

### Matar Processo

```powershell
# Pelo PID (pegue o PID do comando acima)
taskkill /PID <PID> /F

# Exemplo
taskkill /PID 12345 /F
```

### Limpar Docker

```powershell
# Parar todos os containers
docker-compose down

# Remover volumes também
docker-compose down -v

# Limpar tudo do Docker
docker system prune -a
```

## 📂 Caminhos no Windows

### No docker-compose.yml

Os caminhos usam forward slash (`/`), Docker converte automaticamente:

```yaml
volumes:
  - .:/app # ✅ Correto
  - ./mock-data:/data # ✅ Correto
```

### No Terminal

Use tanto forward quanto backslash:

```powershell
cd C:\Users\besco\Documents\projects\...  # ✅
cd C:/Users/besco/Documents/projects/...  # ✅
```

## 🌐 Acessar APIs

### Do Windows para Container

```powershell
# Frontend
Start-Process "http://localhost:3000"

# Mock API
Start-Process "http://localhost:5555"

# Ver dados
Invoke-WebRequest http://localhost:5555/api/articles | Select-Object -Expand Content
```

### Testar com curl (PowerShell 7+)

```powershell
# Listar artigos
curl http://localhost:5555/api/articles

# Com cabeçalhos
curl http://localhost:5555/api/articles `
  -H "Content-Type: application/json"
```

### Ou use Invoke-WebRequest (PowerShell 5.1)

```powershell
# GET
Invoke-WebRequest -Uri http://localhost:5555/api/articles

# POST
$body = @{
    title = "Novo Artigo"
    status = "DRAFT"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5555/api/articles `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## 🐛 Troubleshooting Windows

### Docker não inicia

1. **Verificar Hyper-V** (Windows Pro/Enterprise)

   ```powershell
   # Como Admin
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```

2. **Verificar WSL 2**

   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```

3. **Reiniciar Docker Desktop**

### Performance Lenta

1. Use WSL 2 ao invés de Hyper-V
2. Coloque o projeto em `\\wsl$\Ubuntu\home\...` se possível
3. Aumente recursos no Docker Desktop

### Problemas com Line Endings

```powershell
# Configurar Git para não converter
git config --global core.autocrlf false

# Reconverter arquivos
git rm --cached -r .
git reset --hard
```

### Permission Denied no Volume

1. Verifique File Sharing no Docker Desktop
2. Execute Docker Desktop como Administrador
3. Adicione o drive nas configurações

## 📊 Monitorar Recursos

### Via Docker Desktop

1. Abrir Docker Desktop
2. Aba "Containers"
3. Ver CPU, Memory, Network

### Via PowerShell

```powershell
# Stats em tempo real
docker stats

# Uso de disco
docker system df
```

## 🔄 Atualizações

### Atualizar Dependências

```powershell
# Parar containers
docker-compose down

# Reconstruir
docker-compose build --no-cache

# Iniciar
docker-compose up
```

### Limpar Node Modules

```powershell
# Remover pasta
Remove-Item -Recurse -Force node_modules

# Reinstalar
npm install
```

## 🎯 Atalhos Úteis

### Criar Alias no PowerShell

Adicione no perfil do PowerShell (`$PROFILE`):

```powershell
# Abrir o perfil
notepad $PROFILE

# Adicionar aliases
function DockerUp { docker-compose up }
function DockerDown { docker-compose down }
function DockerLogs { docker-compose logs -f }
function MockAPI { Start-Process "http://localhost:5555" }
function DevApp { Start-Process "http://localhost:3000" }

Set-Alias dup DockerUp
Set-Alias ddown DockerDown
Set-Alias dlogs DockerLogs
```

Agora pode usar: `dup`, `ddown`, `dlogs`

## 📱 Ferramentas Recomendadas Windows

- **Windows Terminal** - Terminal moderno
- **Docker Desktop** - Gerenciador visual do Docker
- **Postman** - Testar APIs
- **VS Code** - Editor com extensões Docker
- **Git Bash** - Terminal Unix-like no Windows

## 🔐 Variáveis de Ambiente

### Ver Variáveis (PowerShell)

```powershell
# Ver todas
Get-ChildItem Env:

# Ver específica
$env:USE_MOCK_API
$env:NEXT_PUBLIC_API_URL
```

### Definir Permanentemente

```powershell
# Para sessão atual
$env:USE_MOCK_API="true"

# Permanentemente (User)
[System.Environment]::SetEnvironmentVariable("USE_MOCK_API", "true", "User")

# Permanentemente (Machine - Admin)
[System.Environment]::SetEnvironmentVariable("USE_MOCK_API", "true", "Machine")
```

## 📚 Links Úteis

- [Docker Desktop Windows](https://docs.docker.com/desktop/windows/)
- [WSL 2 Setup](https://docs.microsoft.com/windows/wsl/install)
- [PowerShell Core](https://github.com/PowerShell/PowerShell)
- [Windows Terminal](https://github.com/microsoft/terminal)

---

**Dica:** Use Windows Terminal com PowerShell 7+ para melhor experiência! 🚀
