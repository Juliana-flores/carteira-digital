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
