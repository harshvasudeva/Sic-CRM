# Sic CRM Backend

Backend API for Sic CRM system.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure your PostgreSQL database in `.env`

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile
- POST /api/auth/change-password - Change password

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get single product
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Invoices
- GET /api/invoices - Get all invoices
- GET /api/invoices/:id - Get single invoice
- GET /api/invoices/:id/pdf - Generate PDF invoice
- POST /api/invoices - Create invoice
- PUT /api/invoices/:id - Update invoice

## Environment Variables

- PORT - Server port (default: 5000)
- DB_HOST - PostgreSQL host
- DB_PORT - PostgreSQL port
- DB_NAME - Database name
- DB_USER - Database user
- DB_PASSWORD - Database password
- JWT_SECRET - JWT secret key
- JWT_EXPIRE - Token expiration time
- SMTP_HOST - SMTP server host
- SMTP_PORT - SMTP server port
- SMTP_USER - SMTP username
- SMTP_PASSWORD - SMTP password
- FRONTEND_URL - Frontend URL for CORS
