# 🏦 NexaBank — Enterprise Banking Microservices System

A full-stack banking platform built with **React + SCSS + Material UI** on the frontend and **Spring Boot microservices** on the backend with **H2 in-memory databases**, pre-seeded with **1000 realistic customer records** per service.

---

## 📁 Project Structure

```
banking-system/
├── frontend/                  # React.js + SCSS + MUI
│   └── src/
│       ├── components/
│       │   ├── Dashboard/     # Overview & stats
│       │   ├── Accounts/      # Account management + detail modal
│       │   ├── Cards/         # Card management + detail modal
│       │   └── Loans/         # Loan management + EMI schedule
│       ├── services/api.js    # Axios API calls to all 3 services
│       └── styles/global.scss # Full design system
│
└── backend/
    ├── account-service/       # Port 8081 — Account & transaction management
    ├── card-service/          # Port 8082 — Credit/Debit/Prepaid card management
    └── loan-service/          # Port 8083 — Loan & EMI management
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** (OpenJDK or Oracle)
- **Maven 3.8+**
- **Node.js 18+** and **npm 9+**

---

### 🔧 Backend — Start All Microservices

Open **3 separate terminals** and run:

#### Terminal 1 — Account Service (Port 8081)
```bash
cd backend/account-service
mvn spring-boot:run
```

#### Terminal 2 — Card Service (Port 8082)
```bash
cd backend/card-service
mvn spring-boot:run
```

#### Terminal 3 — Loan Service (Port 8083)
```bash
cd backend/loan-service
mvn spring-boot:run
```

Each service will:
- Start on its designated port
- Create an H2 in-memory database
- **Auto-seed 1,000 customer records** on first startup
- Expose a Swagger UI for API exploration

---

### 🎨 Frontend — Start React App

```bash
cd frontend
npm install
npm start
```

Opens at: **http://localhost:3000**

---

## 🌐 Service Endpoints

| Service         | Port  | Base URL                        | Swagger UI                              | H2 Console                             |
|-----------------|-------|---------------------------------|-----------------------------------------|----------------------------------------|
| Account Service | 8081  | http://localhost:8081/api/accounts | http://localhost:8081/swagger-ui.html | http://localhost:8081/h2-console       |
| Card Service    | 8082  | http://localhost:8082/api/cards    | http://localhost:8082/swagger-ui.html | http://localhost:8082/h2-console       |
| Loan Service    | 8083  | http://localhost:8083/api/loans    | http://localhost:8083/swagger-ui.html | http://localhost:8083/h2-console       |

---

## 📊 Data Seeded (1000 records each)

### Account Service
- **1,000 bank accounts** — Mix of SAVINGS, CURRENT, SALARY, FIXED_DEPOSIT, RECURRING_DEPOSIT
- **5,000–10,000 transactions** — Credits/debits/transfers per account
- Realistic Indian names, cities, IFSC codes, balances (₹1,000 – ₹50,00,000)

### Card Service
- **1,000 cards** — VISA, MASTERCARD, RUPAY, AMEX networks
- Mix of CREDIT, DEBIT, PREPAID types
- Realistic credit limits, outstanding amounts, reward points
- **7,000–10,000 card transactions** across major Indian merchants

### Loan Service
- **1,000 loans** — HOME, PERSONAL, CAR, EDUCATION, BUSINESS, GOLD loans
- Proper EMI calculations using reducing balance formula
- Repayment schedules with paid/pending EMIs
- Interest rates: 6.5%–18.5% based on loan type

---

## 🔑 Key Features

### Frontend
- **Dark theme** enterprise dashboard
- **Real-time search** across all entities
- **Filter tabs** by account type, card type, loan type
- **Pagination** with 15 records per page
- **Detail modals** with tabbed views (Details / Transactions / Actions)
- **Visual bank card** rendering with network colors
- **EMI schedule** with principal/interest breakdown
- **Progress bars** for loan repayment and credit utilization

### Backend
- **RESTful APIs** with proper HTTP status codes
- **Pagination & sorting** on all list endpoints
- **Search endpoints** with JPQL queries
- **Dashboard statistics** endpoints
- **CORS enabled** for frontend integration
- **Bean Validation** on request bodies
- **Swagger/OpenAPI** documentation on all services
- **H2 Console** for database inspection

---

## 🛠️ API Quick Reference

### Accounts
```
GET    /api/accounts?page=0&size=10    # List all accounts
GET    /api/accounts/search?query=...  # Search accounts
GET    /api/accounts/{id}              # Get by ID
POST   /api/accounts                   # Create account
POST   /api/accounts/{num}/deposit     # Deposit money
POST   /api/accounts/{num}/withdraw    # Withdraw money
PATCH  /api/accounts/{id}/status       # Update status
GET    /api/accounts/{num}/transactions # Get transactions
GET    /api/accounts/stats/dashboard   # Dashboard stats
```

### Cards
```
GET    /api/cards?page=0&size=10       # List all cards
GET    /api/cards/search?query=...     # Search cards
GET    /api/cards/{id}                 # Get by ID
GET    /api/cards/type/{CREDIT}        # Filter by type
POST   /api/cards/{id}/block           # Block card
POST   /api/cards/{id}/unblock         # Unblock card
GET    /api/cards/{num}/transactions   # Get transactions
GET    /api/cards/stats/dashboard      # Dashboard stats
```

### Loans
```
GET    /api/loans?page=0&size=10       # List all loans
GET    /api/loans/search?query=...     # Search loans
GET    /api/loans/{id}                 # Get by ID
GET    /api/loans/type/{HOME_LOAN}     # Filter by type
GET    /api/loans/{num}/emi-schedule   # Get EMI schedule
GET    /api/loans/stats/dashboard      # Dashboard stats
```

---

## 🏗️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18, React Router 6 |
| UI Library | Material UI v5          |
| Styling    | SCSS with design tokens |
| HTTP       | Axios                   |
| Backend    | Spring Boot 3.2         |
| Language   | Java 17                 |
| ORM        | Spring Data JPA         |
| Database   | H2 (in-memory)          |
| Docs       | SpringDoc OpenAPI 2.3   |
| Build      | Maven                   |

---

## 💡 Notes

- H2 databases are **in-memory** — data resets on service restart
- All services are **independent** — can be started/stopped individually
- CORS is configured to allow requests from `localhost:3000`
- For persistent storage, replace H2 with MySQL/PostgreSQL in `application.properties`
