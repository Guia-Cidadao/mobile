# 📱 Guia Cidadão — Mobile App

Plataforma mobile **CitizenTech** desenvolvida em **React Native (Expo)** para consulta descomplicada de serviços públicos oficiais, checklist de documentos obrigatórios e orientação cidadã assistida por Inteligência Artificial.

> Projeto desenvolvido no contexto da **Global Solution · FIAP CitizenTech**, seguindo diretrizes de usabilidade, acessibilidade (Apple HIG / Material Design), arquitetura em camadas e integração RESTful com autenticação JWT.

---

## Link do video
https://youtu.be/kLTmztvlTRQ

## ✨ Principais Funcionalidades

- **Autenticação e Sessão Segura (`/auth`)**
  - Login e cadastro de cidadãos com validação de formulário em tempo real e indicador visual de força de senha.
  - Persistência segura do token JWT e dados da sessão via `expo-secure-store` (Keychain no iOS / Keystore no Android) com fallback para `localStorage` na Web.
  - Expiração automática de sessão com detecção de validade do JWT e redirecionamento protegido por guardião de rotas (`NavigationGuard`).

- **Controle de Acesso por Perfil (`ROLE_USER` e `ROLE_ADMIN`)**
  - **Cidadão (`ROLE_USER`):** consulta ao catálogo de serviços públicos, checklist interativo de documentos, uso do Assistente Cidadão e gerenciamento do próprio perfil.
  - **Administrador Público (`ROLE_ADMIN`):** permissão adicional para cadastrar, editar e excluir serviços públicos e suas listas de documentos obrigatórios diretamente pelo app.

- **Catálogo de Serviços Públicos (`/api/servicos`)**
  - Listagem paginada com carregamento incremental (*infinite scroll*) e atualização por gesto (*pull-to-refresh*).
  - Busca instantânea por nome do serviço, descrição ou documento exigido (ex.: RG, CPF, Comprovante de Residência).
  - Tela de detalhes com **checklist interativo de documentos**, permitindo ao cidadão marcar os itens que já separou para o atendimento.

- **Assistente Cidadão com IA (`/api/chatbot`)**
  - Interface conversacional com sugestões rápidas de perguntas e indicador de processamento.
  - Exibição das fontes oficiais retornadas pela IA com atalhos diretos para abrir a página de detalhes de cada serviço relacionado.

- **Gestão de Conta e Transparência (`/api/user` e Sobre o App)**
  - Atualização de dados cadastrais (nome, e-mail e senha) e opção de exclusão permanente da conta com confirmação de segurança.
  - Tela **Sobre o App** exibindo versão da build, data de geração, endpoint ativo da API e o **Hash do Commit de Referência**.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
| :--- | :--- |
| **Framework Mobile** | React Native `0.88.1` + React `19.3.0` |
| **Plataforma & Build** | Expo SDK `~58.0` + EAS Build |
| **Roteamento** | Expo Router `~58.0` (File-based routing + Typed Routes) |
| **Linguagem** | TypeScript `~6.0` (Strict Mode) |
| **Cliente HTTP** | Axios `^1.21` (Interceptors, Retry & Auto-discovery local) |
| **Armazenamento Seguro** | Expo Secure Store |
| ** Estilização & UI** | StyleSheet nativo, Tema customizado, Fonte *Poppins* e `@expo/vector-icons` (Ionicons) |
| **Qualidade de Código** | ESLint `^9.39` + Prettier `^3.9` |

---

## 📂 Estrutura do Projeto

```text
fronted/
├── assets/
│   ├── fonts/                  # Família tipográfica Poppins (Regular, Medium, SemiBold, Bold)
│   └── images/                 # Ícones do app, logo e splash screen
├── src/
│   ├── app/                    # Rotas da aplicação (Expo Router)
│   │   ├── (auth)/             # Fluxo público: login.tsx, register.tsx
│   │   ├── (app)/              # Fluxo autenticado
│   │   │   ├── (tabs)/         # Abas principais: index.tsx (Serviços), assistant.tsx, profile.tsx
│   │   │   ├── profile/        # Edição de perfil (edit.tsx)
│   │   │   ├── services/       # Detalhes ([id].tsx) e formulário admin (form.tsx)
│   │   │   └── about.tsx       # Informações da build e commit hash
│   │   └── _layout.tsx         # Root Layout, Providers e NavigationGuard
│   ├── components/
│   │   ├── feedback/           # EmptyState, ErrorState, InlineAlert, LoadingState, Toast
│   │   ├── services/           # ServiceCard
│   │   └── ui/                 # AppButton, AppText, Card, ConfirmDialog, IconButton, TextField, etc.
│   ├── config/
│   │   └── env.ts              # Resolução inteligente de ambiente e URLs da API
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Estado global de autenticação e sessão JWT
│   │   └── ToastContext.tsx    # Notificações visuais globais
│   ├── services/
│   │   ├── api/                # Instância Axios (httpClient), tratamento de erros e paginação Spring
│   │   ├── storage/            # Persistência segura de sessão (sessionStore)
│   │   ├── authService.ts      # Login e registro (/auth)
│   │   ├── servicoService.ts   # CRUD de serviços públicos (/api/servicos)
│   │   ├── chatbotService.ts   # Perguntas ao assistente virtual (/api/chatbot)
│   │   └── userService.ts      # Consulta, atualização e exclusão de usuário (/api/user)
│   ├── theme/                  # Tokens de cores, espaçamentos, tipografia e sombras
│   ├── types/                  # Contratos TypeScript (Auth, User, Servico, Chatbot, Pagination)
│   └── utils/                  # Decodificação JWT e validadores de formulário
├── .env.example                # Modelo de variáveis de ambiente
├── app.config.ts               # Configuração dinâmica do Expo (inclui detecção de LAN e commit hash)
├── eas.json                    # Perfis de build (development, preview, production)
├── package.json                # Dependências e scripts
└── tsconfig.json               # Configuração do TypeScript
```

---

## 🔌 Integração com o Backend (API REST)

O aplicativo consome uma API REST desenvolvida em **Java 21 + Spring Boot 3 + Spring Security JWT + PostgreSQL**:

| Módulo | Método e Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /auth/login` | Autentica o usuário e retorna o token JWT | Público |
| **Auth** | `POST /auth/register` | Cadastra um novo usuário | Público |
| **Serviços** | `GET /api/servicos/all` | Lista serviços públicos paginados (`page`, `size`, `sort`) | Autenticado |
| **Serviços** | `GET /api/servicos/id/{id}` | Busca detalhes de um serviço por ID | Autenticado |
| **Serviços** | `GET /api/servicos/nome/{nome}` | Busca um serviço pelo nome | Autenticado |
| **Serviços** | `POST /api/servicos/save` | Cadastra um novo serviço público | `ROLE_ADMIN` |
| **Serviços** | `PUT /api/servicos/{id}` | Atualiza um serviço público existente | `ROLE_ADMIN` |
| **Serviços** | `DELETE /api/servicos/{id}` | Remove um serviço público | `ROLE_ADMIN` |
| **Chatbot** | `POST /api/chatbot/perguntar` | Envia pergunta ao assistente de IA e retorna resposta + fontes | Autenticado |
| **Usuário** | `GET /api/user/{id}` | Obtém dados do usuário autenticado | Autenticado |
| **Usuário** | `PUT /api/user/{id}` | Atualiza nome, e-mail e senha do usuário | Autenticado |
| **Usuário** | `DELETE /api/user/{id}` | Exclui permanentemente a conta do usuário | Autenticado |

### Descoberta Automática de Conexão Local
Quando configurado para ambiente local (`localhost`), o cliente HTTP (`httpClient.ts` + `env.ts`) testa automaticamente os candidatos de rede compatíveis com cada plataforma (IP da LAN Wi-Fi para dispositivos físicos no Expo Go, `10.0.2.2` para emulador Android e `localhost`/`127.0.0.1` para Web/iOS Simulator), realizando *fallback* transparente em caso de falha de rede.

---

## ⚙️ Pré-requisitos e Configuração

### Pré-requisitos
- **Node.js** (versão LTS recomendada)
- **npm**
- **Expo Go** instalado no dispositivo físico (Android/iOS) ou emulador configurado
- API Backend do **Guia Cidadão** em execução (por padrão na porta `8080`)

### 1. Instalar dependências

```bash
cd fronted
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `fronted/` tomando como base o arquivo `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` informando a URL base da API Backend (não inclua chaves secretas ou credenciais privadas neste arquivo, pois variáveis `EXPO_PUBLIC_*` são embutidas no pacote do cliente):

```env
# Exemplo para desenvolvimento local
EXPO_PUBLIC_API_URL=http://localhost:8080

# Opcional: definir manualmente o hash do commit em pipelines de CI/CD
# EXPO_PUBLIC_COMMIT_HASH=<hash-do-commit>
```

> **Nota de Segurança:** O arquivo `.env` já está listado no `.gitignore`. Nunca versione credenciais, tokens ou chaves privadas no repositório.

---

## 🚀 Como Executar o Projeto

Dentro do diretório `fronted/`, utilize os scripts disponíveis no `package.json`:

```bash
# Iniciar o servidor de desenvolvimento do Expo (Metro Bundler)
npm start

# Executar diretamente no Android (Emulador ou dispositivo conectado)
npm run android

# Executar diretamente no iOS (Simulator no macOS)
npm run ios

# Executar no navegador Web
npm run web
```

### Scripts de Qualidade e Padronização

```bash
# Verificar tipagem estática com TypeScript
npm run typecheck

# Executar análise estática do código (ESLint)
npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Verificar ou formatar o código com Prettier
npm run format:check
npm run format
```

---

## 📦 Build e Publicação (EAS)

O projeto conta com configuração pronta no arquivo `eas.json` para geração de pacotes via **EAS Build**:

```bash
# Build de desenvolvimento (Development Client)
npx eas-cli build --profile development --platform android

# Build interna de homologação/teste (gera APK)
npx eas-cli build --profile preview --platform android

# Build de produção (gera APK com autoIncrement)
npx eas-cli build --profile production --platform android
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.
