# ConvFlow Markdown - Estrutura do Projeto

## 📁 Estrutura de Pastas Organizada

### **RAIZ LIMPA** - Apenas arquivos essenciais
```
convflow-markdown/
├── 📄 .env / .env.example     # Configurações de ambiente
├── 📄 menu.bat                # Menu interativo principal
├── 📄 README.md               # Documentação principal
├── 📄 README_ESTRUTURA.md     # Este arquivo
├── 📄 pyproject.toml          # Configuração Python
├── 📄 package.json            # Configuração Node.js
├── 📄 requirements.txt        # Dependências Python
├── 📄 uv.lock                 # Lock file do uv
└── 📁 [pastas organizadas]    # Estrutura detalhada abaixo
```

### `/docker/` - Arquivos de Container
```
docker/
├── docker-compose.yml           # Compose principal
├── docker-compose.keycloak.yml  # Compose específico Keycloak
├── Dockerfile                   # Build da aplicação
└── nginx.conf                   # Configuração Nginx
```

### `/scripts/` - Scripts de Automação
```
scripts/
├── start/           # Scripts de inicialização de serviços
│   ├── start_services.bat/sh     # Inicia frontend + backend
│   ├── start_backend.bat/sh      # Apenas backend FastAPI
│   ├── check_services.bat        # Verifica status dos serviços
│   └── stop_services.bat         # Para todos os serviços
│
├── tests/           # Scripts de teste
│   ├── teste-api-programatica.ps1     # Teste da API Keycloak
│   ├── teste-basico.ps1               # Teste básico de conectividade
│   ├── test_cloudflare_ai.py          # Teste da integração AI
│   └── teste-final.ps1                # Teste completo do sistema
│
├── setup/           # Scripts de configuração inicial
│   ├── setup-keycloak-complete.ps1    # Setup completo do Keycloak
│   ├── preparar-frontend.ps1          # Preparação do frontend
│   ├── setup.sh/setup_linux.sh        # Setup para Linux
│   └── install_deps.sh                # Instalação de dependências
│
└── keycloak/        # Scripts específicos do Keycloak
    ├── discover-keycloak-v26.ps1      # Descoberta da configuração
    ├── create-test-user.ps1/sh        # Criação de usuário teste
    ├── configurar-autoregistro.ps1    # Configuração de auto-registro
    ├── keycloak-fixes-summary.sh      # Resumo de correções
    ├── keycloak-setup/                # Pasta de configurações
    └── keycloak_configuration.json    # Configuração JSON
```

### `/docs/` - Documentação
```
docs/
├── PROJECT_STATUS.md           # Status atual do projeto
├── DEPENDENCIES.md            # Dependências e bibliotecas
├── DOCKER_DEPLOYMENT.md       # Deployment com Docker
├── FILE_ORGANIZATION.md       # Organização de arquivos
├── API_PROGRAMATICA_EXPLICACAO.md  # Documentação da API
│
└── archive/                   # Documentação arquivada
    ├── KEYCLOAK_*.md         # Documentos antigos do Keycloak
    ├── GUIA_*.md            # Guias antigos
    └── *.html               # Arquivos HTML de teste
```

### `/src/` - Código Fonte Backend
```
src/
├── main.py                    # Aplicação FastAPI principal
├── models/                    # Modelos de dados
│   └── auth.py
├── routes/                    # Rotas da API
│   ├── auth.py               # Autenticação
│   ├── user.py               # Usuários básicos
│   └── keycloak_users.py     # Gerenciamento Keycloak
└── services/                  # Serviços
    ├── auth_service.py       # Serviço de autenticação
    ├── cloudflare_ai.py      # Integração Cloudflare AI
    ├── database.py           # Conexão com banco
    └── keycloak_user_manager.py  # Gerenciador Keycloak
```

### `/frontend/` - Código Fonte Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/            # Componentes administrativos
│   │   │   └── UserManagement.tsx
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── common/           # Componentes comuns
│   │   └── dashboard/        # Componentes do dashboard
│   ├── pages/
│   │   ├── Admin.tsx         # Página de administração
│   │   ├── Dashboard.tsx     # Dashboard principal
│   │   └── ...
│   ├── contexts/             # Contextos React
│   └── services/             # Serviços do frontend
└── public/                   # Arquivos públicos
```

## 🚀 Como Usar

### Iniciar Serviços
```bash
# Windows
.\scripts\start\start_services.bat

# Linux/Mac
./scripts/start/start_services.sh
```

### Verificar Status
```bash
# Windows
.\scripts\start\check_services.bat
```

### Executar Testes
```bash
# Teste da API Programática
.\scripts\tests\teste-api-programatica.ps1

# Teste básico
.\scripts\tests\teste-basico.ps1
```

### Setup Inicial
```bash
# Setup completo do Keycloak
.\scripts\setup\setup-keycloak-complete.ps1

# Preparar frontend
.\scripts\setup\preparar-frontend.ps1
```

## 🔧 Configuração

### Variáveis de Ambiente (`.env`)
- **Keycloak**: URLs, client ID/secret, realm
- **Database**: Connection string PostgreSQL (Neon)
- **APIs**: Cloudflare AI, endpoints da aplicação
- **JWT**: Secret key para autenticação

### Serviços
- **Backend**: FastAPI (porta 8000)
- **Frontend**: React/Vite (porta 5173)
- **Keycloak**: Servidor externo (Azure)
- **Database**: PostgreSQL (Neon)

## 📚 Funcionalidades

### ✅ Implementado
- Autenticação via Keycloak
- API programática para gerenciamento de usuários
- Interface administrativa React
- Conversão de arquivos (Markdown)
- Integração com Cloudflare AI

### 🔄 Em Desenvolvimento
- Melhorias na interface administrativa
- Validações adicionais
- Testes automatizados
- Documentação da API

## 🛠️ Tecnologias

- **Backend**: Python, FastAPI, uvicorn
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Autenticação**: Keycloak
- **Database**: PostgreSQL (Neon)
- **AI**: Cloudflare AI
- **Deploy**: Docker, Azure
