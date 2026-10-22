# NOVA Bank

A full-stack digital banking and wallet application built to simulate core banking operations such as account management, deposits, withdrawals, transfers, bill payments, and transaction tracking.

The project consists of a RESTful backend built with **Node.js, Express, and PostgreSQL**, alongside a **React + TypeScript frontend**.

> **Status:** Backend completed and functional. Frontend currently under development.

---

## Overview

NOVA Bank is a full-stack banking application designed to provide users with a simple interface for managing their finances digitally.

The application supports core banking operations while following backend development practices such as authentication, authorization, input validation, database transactions, error handling, logging, and secure password management.

The project is also being used as a practical full-stack learning project to understand how a real-world frontend communicates with a backend API.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Separate user and admin authentication
- Role-based access control

### Banking Operations

- Create and manage accounts
- Deposit funds
- Withdraw funds
- Transfer money between accounts
- Pay bills
- View transaction history
- Manage supported currencies

### Admin Operations

- Admin authentication
- Protected admin routes
- User management
- Account management
- Transaction management
- Administrative operations

### Backend Engineering

- RESTful API architecture
- PostgreSQL database
- Connection pooling
- Parameterized SQL queries
- Database transactions and rollback
- Centralized error handling
- Custom application errors
- Request logging
- Winston logging
- Input validation
- Environment variable configuration

### Frontend

The frontend is being developed with:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

The frontend will provide separate experiences for:

- Public users
- Authenticated banking users
- Administrators

---

## Tech Stack

### Backend

| Technology | Purpose              |
| ---------- | -------------------- |
| Node.js    | JavaScript runtime   |
| Express.js | Backend framework    |
| PostgreSQL | Relational database  |
| `pg`       | PostgreSQL client    |
| JWT        | Authentication       |
| bcrypt     | Password hashing     |
| Joi        | Input validation     |
| Nodemailer | Email functionality  |
| Winston    | Application logging  |
| Morgan     | HTTP request logging |

### Frontend

| Technology   | Purpose                |
| ------------ | ---------------------- |
| React        | UI library             |
| TypeScript   | Type safety            |
| Vite         | Development/build tool |
| Tailwind CSS | Styling                |
| React Router | Client-side routing    |
| Axios        | API communication      |

---

## Project Architecture

```text
Bank-Wallet-MAIN/
│
├── src/                       # Backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── ...
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── ...
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

## Application Flow

The backend follows a layered architecture:

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Model / Database Query
  ↓
PostgreSQL
```

The frontend communicates with the backend through REST API endpoints:

```text
React Page
    ↓
Component
    ↓
API Function
    ↓
Axios
    ↓
Express API
    ↓
Controller
    ↓
PostgreSQL
```

---

## Security

The project implements several security practices, including:

- Password hashing using bcrypt
- JWT authentication
- Separate JWT secrets for users and administrators
- Protected API routes
- Parameterized SQL queries
- Input validation
- Environment variables for sensitive configuration
- Database transactions for financial operations
- Transaction rollback when operations fail

Sensitive credentials and secrets should never be committed to the repository.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

---

## Installation

Clone the repository:

```bash
git clone https://github.com/NwakanmaEmmanuel/Bank_Wallet_Main.git
```

Navigate into the project:

```bash
cd Bank_Wallet-MAIN
```

Install backend dependencies:

```bash
npm install
```

Navigate to the frontend:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file for the backend configuration.

Example:

```env
PORT=6000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=Bank-Wallet
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Never commit your actual `.env` file or secrets to GitHub.

---

## Running the Application

### Start the backend

From the project root:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:6000
```

### Start the frontend

Open another terminal:

```bash
cd frontend
```

Then:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## API Modules

The backend currently contains functionality for:

```text
Authentication
    ├── User authentication
    └── Admin authentication

Accounts
    └── Account management

Transactions
    ├── Deposits
    ├── Withdrawals
    ├── Transfers
    └── Bill payments

Administration
    ├── User management
    ├── Account management
    └── Transaction management
```

---

## Frontend Roadmap

The frontend is being developed incrementally.

### Phase 1 — Foundation

- [x] React + TypeScript + Vite setup
- [ ] Homepage
- [ ] Navigation
- [ ] Responsive layout
- [ ] Tailwind CSS setup

### Phase 2 — Authentication

- [ ] Login page
- [ ] Registration page
- [ ] Authentication context
- [ ] Protected routes
- [ ] Token management

### Phase 3 — User Dashboard

- [ ] Dashboard
- [ ] Account overview
- [ ] Balance display
- [ ] Quick actions
- [ ] Recent transactions

### Phase 4 — Banking Operations

- [ ] Accounts
- [ ] Transfers
- [ ] Deposits
- [ ] Withdrawals
- [ ] Bill payments
- [ ] Transaction history

### Phase 5 — Administration

- [ ] Admin dashboard
- [ ] User management
- [ ] Account management
- [ ] Transaction management
- [ ] Admin authorization

### Phase 6 — Improvements

- [ ] Form validation
- [ ] Loading states
- [ ] Error states
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Production deployment

---

## Testing Strategy

The application is developed incrementally.

Each major feature follows:

```text
Build
  ↓
Test
  ↓
Connect to API
  ↓
Test successful request
  ↓
Test invalid input
  ↓
Test unauthorized access
  ↓
Handle errors
  ↓
Test again
```

This helps ensure that both the frontend and backend behave correctly before moving to the next feature.

---

## Project Goals

This project is being developed to gain practical experience with:

- Full-stack development
- REST API architecture
- React application architecture
- TypeScript
- PostgreSQL
- Authentication and authorization
- Financial transaction workflows
- Database transactions
- API integration
- Error handling
- Application security
- Scalable project structure

---

## Future Improvements

Possible future improvements include:

- Two-factor authentication
- Email notifications
- Transaction receipts
- Advanced transaction filtering
- Pagination
- Search
- Spending analytics
- Improved admin analytics
- Automated testing
- Docker support
- CI/CD
- Production deployment

---

## Disclaimer

NOVA Bank is a software development and learning project. It is not a real financial institution and should not be used to process real financial transactions.

---

## Author

**Nwakanma Emmanuel**

Full-Stack Developer | Pure Mathematics Student

GitHub: [NwakanmaEmmanuel](https://github.com/NwakanmaEmmanuel)
