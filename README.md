# 💰 Carteira Digital API

API REST de carteira digital desenvolvida com **NestJS**, simulando funcionalidades reais de um banco digital como transferências, depósitos e autenticação segura.

## 🚀 Tecnologias

| Tecnologia               | Uso                                             |
| ------------------------ | ----------------------------------------------- |
| **NestJS**               | Framework backend com arquitetura modular       |
| **PostgreSQL**           | Banco de dados relacional com transações ACID   |
| **Redis**                | Cache de saldo e rate limiting                  |
| **AWS SQS (LocalStack)** | Fila de mensagens para processamento assíncrono |
| **JWT**                  | Autenticação e autorização                      |
| **Docker**               | Containerização dos serviços                    |
| **Jest**                 | Testes automatizados                            |
| **GitHub Actions**       | CI/CD — testes automáticos a cada push          |

## 🏗️ Arquitetura

```
Cliente
   │
   ▼
API (NestJS)
   │
   ├── PostgreSQL  → dados permanentes com transações ACID
   ├── Redis       → cache de saldo + rate limiting
   └── SQS         → fila de transferências
                        │
                        ▼
                    Worker Node.js
                    (processa mensagens da fila)
```

## ⚙️ Funcionalidades

- ✅ Cadastro e autenticação de usuários com JWT
- ✅ Consulta de saldo com cache Redis
- ✅ Depósito com transaction no banco
- ✅ Transferência entre usuários com validação de saldo
- ✅ Rate limiting — máximo 5 transferências por minuto
- ✅ Fila SQS para processamento assíncrono
- ✅ Histórico de transações

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT em todos os endpoints protegidos
- Rate limiting contra abuso de transferências
- Validação de todos os dados de entrada com class-validator
- Variáveis sensíveis isoladas em `.env`

## 📦 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Docker

### 1. Clone o repositório

```bash
git clone https://github.com/Juliana-flores/carteira-digital.git
cd carteira-digital
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

### 4. Suba os serviços com Docker

```bash
docker-compose up -d
```

### 5. Crie a fila SQS no LocalStack

```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name transferencias
```

### 6. Inicie a aplicação

```bash
npm run start:dev
```

## 🧪 Testes

```bash
# Rodar testes
npm run test

# Cobertura de testes
npm run test:cov
```

## 📡 Endpoints

### Autenticação

| Método | Rota              | Descrição         |
| ------ | ----------------- | ----------------- |
| POST   | `/users/register` | Cadastrar usuário |
| POST   | `/auth/login`     | Fazer login       |

### Carteira (requer JWT)

| Método | Rota               | Descrição                     |
| ------ | ------------------ | ----------------------------- |
| GET    | `/wallet/balance`  | Consultar saldo               |
| POST   | `/wallet/deposit`  | Depositar valor               |
| POST   | `/wallet/transfer` | Transferir para outro usuário |
| GET    | `/wallet/history`  | Histórico de transações       |

## 🔄 CI/CD

O projeto usa **GitHub Actions** para rodar os testes automaticamente a cada push na branch `main`.

## ☸️ Kubernetes

O projeto inclui manifests Kubernetes prontos para deploy em produção (EKS na AWS).

```bash
# Criar namespace
kubectl apply -f k8s/namespace.yaml

# Criar secrets
kubectl apply -f k8s/secrets.yaml

# Deploy da aplicação
kubectl apply -f k8s/deployment.yaml

# Expor o serviço
kubectl apply -f k8s/service.yaml

# Configurar auto-scaling
kubectl apply -f k8s/hpa.yaml

# Verificar status
kubectl get pods -n carteira-digital
```

### Auto-scaling

O HPA (Horizontal Pod Autoscaler) escala automaticamente entre **2 e 10 instâncias** baseado em CPU e memória — garantindo que a aplicação aguente picos de tráfego sem intervenção manual.

<svg viewBox="0 0 900 650" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">

  <!-- Background -->
  <rect width="900" height="650" fill="#F8FAFC" rx="12"/>

  <!-- Title -->

<text x="450" y="38" text-anchor="middle" font-size="20" font-weight="bold" fill="#1A3C5E">Arquitetura — Carteira Digital API</text>
<text x="450" y="58" text-anchor="middle" font-size="12" fill="#888">NestJS · PostgreSQL · Redis · SQS · Kubernetes</text>

  <!-- ═══════════════════════════════ -->
  <!-- CLIENT -->
  <!-- ═══════════════════════════════ -->
  <rect x="370" y="75" width="160" height="50" rx="8" fill="#1A3C5E"/>
  <text x="450" y="96" text-anchor="middle" font-size="13" font-weight="bold" fill="white">📱 Cliente</text>
  <text x="450" y="114" text-anchor="middle" font-size="11" fill="#AAC4E0">App Teste</text>

  <!-- Arrow down -->
  <line x1="450" y1="125" x2="450" y2="148" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="465" y="142" font-size="10" fill="#94A3B8">HTTPS</text>

  <!-- ═══════════════════════════════ -->
  <!-- KUBERNETES BOX -->
  <!-- ═══════════════════════════════ -->
  <rect x="60" y="155" width="780" height="220" rx="10" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="80" y="175" font-size="11" fill="#3B82F6" font-weight="bold">☸️ Kubernetes (EKS) — HPA: 2 a 10 pods</text>

  <!-- API GATEWAY -->
  <rect x="330" y="183" width="240" height="50" rx="8" fill="#2E75B6"/>
  <text x="450" y="204" text-anchor="middle" font-size="13" font-weight="bold" fill="white">🔀 API Gateway</text>
  <text x="450" y="221" text-anchor="middle" font-size="11" fill="#AAC4E0">Auth · Rate Limit · Roteamento</text>

  <!-- Arrow down -->
  <line x1="450" y1="233" x2="450" y2="253" stroke="#94A3B8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- NESTJS PODS -->
  <rect x="130" y="258" width="200" height="55" rx="8" fill="#1A3C5E"/>
  <text x="230" y="279" text-anchor="middle" font-size="12" font-weight="bold" fill="white">⚙️ NestJS Pod 1</text>
  <text x="230" y="296" text-anchor="middle" font-size="10" fill="#AAC4E0">auth · users · wallet</text>
  <text x="230" y="308" text-anchor="middle" font-size="10" fill="#AAC4E0">JWT · bcrypt · validação</text>

  <rect x="350" y="258" width="200" height="55" rx="8" fill="#1A3C5E"/>
  <text x="450" y="279" text-anchor="middle" font-size="12" font-weight="bold" fill="white">⚙️ NestJS Pod 2</text>
  <text x="450" y="296" text-anchor="middle" font-size="10" fill="#AAC4E0">auth · users · wallet</text>
  <text x="450" y="308" text-anchor="middle" font-size="10" fill="#AAC4E0">JWT · bcrypt · validação</text>

  <rect x="570" y="258" width="200" height="55" rx="8" fill="#1A3C5E" opacity="0.5"/>
  <text x="670" y="279" text-anchor="middle" font-size="12" font-weight="bold" fill="white">⚙️ NestJS Pod N</text>
  <text x="670" y="296" text-anchor="middle" font-size="10" fill="#AAC4E0">escala automática</text>
  <text x="670" y="308" text-anchor="middle" font-size="10" fill="#AAC4E0">HPA → CPU &gt; 70%</text>

  <!-- dots between pods -->

<text x="545" y="290" font-size="18" fill="#94A3B8">···</text>

  <!-- lines from gateway to pods -->
  <line x1="390" y1="233" x2="230" y2="258" stroke="#94A3B8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="450" y1="233" x2="450" y2="258" stroke="#94A3B8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="510" y1="233" x2="670" y2="258" stroke="#94A3B8" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- liveness probe note -->

<text x="75" y="345" font-size="10" fill="#3B82F6">💓 liveness &amp; readiness probes — Kubernetes reinicia pods com problema</text>

  <!-- ═══════════════════════════════ -->
  <!-- DATA LAYER -->
  <!-- ═══════════════════════════════ -->

  <!-- REDIS -->
  <rect x="60" y="420" width="190" height="90" rx="8" fill="#DC2626"/>
  <text x="155" y="445" text-anchor="middle" font-size="13" font-weight="bold" fill="white">⚡ Redis</text>
  <text x="155" y="463" text-anchor="middle" font-size="10" fill="#FCA5A5">Cache de saldo (30s TTL)</text>
  <text x="155" y="478" text-anchor="middle" font-size="10" fill="#FCA5A5">Rate limiting transferências</text>
  <text x="155" y="493" text-anchor="middle" font-size="10" fill="#FCA5A5">Sessão de usuário</text>

  <!-- POSTGRES -->
  <rect x="290" y="420" width="190" height="90" rx="8" fill="#15803D"/>
  <text x="385" y="445" text-anchor="middle" font-size="13" font-weight="bold" fill="white">🗄️ Aurora PostgreSQL</text>
  <text x="385" y="463" text-anchor="middle" font-size="10" fill="#86EFAC">Usuários · Carteiras</text>
  <text x="385" y="478" text-anchor="middle" font-size="10" fill="#86EFAC">Transações (ACID)</text>
  <text x="385" y="493" text-anchor="middle" font-size="10" fill="#86EFAC">Failover automático</text>

  <!-- SQS -->
  <rect x="520" y="420" width="190" height="90" rx="8" fill="#B45309"/>
  <text x="615" y="445" text-anchor="middle" font-size="13" font-weight="bold" fill="white">📨 AWS SQS</text>
  <text x="615" y="463" text-anchor="middle" font-size="10" fill="#FCD34D">Fila de transferências</text>
  <text x="615" y="478" text-anchor="middle" font-size="10" fill="#FCD34D">Processamento assíncrono</text>
  <text x="615" y="493" text-anchor="middle" font-size="10" fill="#FCD34D">Retry automático</text>

  <!-- WORKER -->
  <rect x="710" y="420" width="170" height="90" rx="8" fill="#6D28D9"/>
  <text x="795" y="445" text-anchor="middle" font-size="13" font-weight="bold" fill="white">🔄 Worker</text>
  <text x="795" y="463" text-anchor="middle" font-size="10" fill="#C4B5FD">Consome fila SQS</text>
  <text x="795" y="478" text-anchor="middle" font-size="10" fill="#C4B5FD">Processa transferências</text>
  <text x="795" y="493" text-anchor="middle" font-size="10" fill="#C4B5FD">Delete após sucesso</text>

  <!-- ═══════════════════════════════ -->
  <!-- OBSERVABILITY -->
  <!-- ═══════════════════════════════ -->
  <rect x="60" y="550" width="780" height="70" rx="8" fill="#0F172A"/>
  <text x="450" y="572" text-anchor="middle" font-size="13" font-weight="bold" fill="white">📊 Observabilidade</text>
  <text x="200" y="595" text-anchor="middle" font-size="11" fill="#94A3B8">📋 Logs estruturados</text>
  <text x="200" y="610" text-anchor="middle" font-size="10" fill="#64748B">o que aconteceu</text>
  <text x="450" y="595" text-anchor="middle" font-size="11" fill="#94A3B8">📈 Métricas (CloudWatch)</text>
  <text x="450" y="610" text-anchor="middle" font-size="10" fill="#64748B">latência · erros · CPU</text>
  <text x="700" y="595" text-anchor="middle" font-size="11" fill="#94A3B8">🔍 Traces distribuídos</text>
  <text x="700" y="610" text-anchor="middle" font-size="10" fill="#64748B">rastrear requisição ponta a ponta</text>

  <!-- ═══════════════════════════════ -->
  <!-- CONNECTOR LINES (pods to data) -->
  <!-- ═══════════════════════════════ -->

  <!-- pods to redis -->
  <line x1="200" y1="313" x2="155" y2="420" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowRed)"/>

  <!-- pods to postgres -->
  <line x1="310" y1="313" x2="360" y2="420" stroke="#15803D" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowGreen)"/>
  <line x1="450" y1="313" x2="400" y2="420" stroke="#15803D" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowGreen)"/>

  <!-- pods to sqs -->
  <line x1="540" y1="313" x2="590" y2="420" stroke="#B45309" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowOrange)"/>

  <!-- sqs to worker -->
  <line x1="710" y1="465" x2="710" y2="465" stroke="#6D28D9" stroke-width="1.5"/>
  <line x1="710" y1="465" x2="710" y2="465" stroke="#6D28D9" stroke-width="1.5"/>
  <path d="M 710 465 L 710 465" stroke="#6D28D9" stroke-width="1.5"/>
  <line x1="710" y1="462" x2="712" y2="462" stroke="#6D28D9" stroke-width="2" marker-end="url(#arrowPurple)"/>

  <!-- worker to postgres -->
  <path d="M 795 510 Q 795 540 385 540 L 385 510" stroke="#6D28D9" stroke-width="1.5" stroke-dasharray="4,3" fill="none" marker-end="url(#arrowPurple)"/>

  <!-- data to observability -->
  <line x1="230" y1="510" x2="230" y2="550" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="450" y1="510" x2="450" y2="550" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="650" y1="510" x2="650" y2="550" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- ═══════════════════════════════ -->
  <!-- ARROW MARKERS -->
  <!-- ═══════════════════════════════ -->
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8"/>
    </marker>
    <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#DC2626"/>
    </marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#15803D"/>
    </marker>
    <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#B45309"/>
    </marker>
    <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#6D28D9"/>
    </marker>
  </defs>

</svg>
