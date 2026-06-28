# Inventra — Inventory Management System

Inventra is a fullstack inventory management web application built to help businesses track products, manage stock transactions, and monitor inventory in real time. This project was developed as part of my fullstack learning journey, with a focus on modern web architecture, role-based authentication, and cloud deployment.

## Live Demo

[https://inventra-inventory-management-3yub-lgzb23if5-xellzarra.vercel.app](https://inventra-inventory-management-3yub-lgzb23if5-xellzarra.vercel.app)

**Demo Credentials**

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@inventra.com  | admin123  |
| Staff | staff@inventra.com  | staff123  |

## Features

- JWT-based authentication with role-based access control (Admin and Staff)
- Dashboard with an overview of total products, stock value, low stock alerts, and recent transactions
- Full product management including SKU, price, stock tracking, and minimum stock thresholds
- Category and supplier management to keep inventory organized
- Stock transaction history for both incoming and outgoing stock
- Inventory reports with stock value and status per product
- Audit logs to track user actions across the system
- Responsive and clean UI accessible across devices

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 16, TypeScript, Tailwind CSS    |
| Backend    | Next.js API Routes (App Router)         |
| ORM        | Prisma v7                               |
| Database   | MySQL hosted on Railway                 |
| Auth       | JWT + bcryptjs                          |
| Deployment | Vercel (app) + Railway (database)       |

## Project Structure

```
inventra/
├── app/
│   ├── api/          # API routes for auth, products, dashboard, reports, etc.
│   └── (pages)/      # Frontend pages
├── components/       # Reusable UI components
├── lib/              # Prisma client, auth utilities, and audit logger
├── prisma/
│   ├── schema.prisma # Database schema
│   ├── migrations/   # Migration history
│   └── seed.ts       # Seed data
└── prisma.config.ts  # Prisma v7 configuration
```

## Database Schema

The application is built around six core models: User handles authentication and role management, Product stores product data including SKU, price, and stock levels, Category and Supplier keep inventory organized, StockTransaction records every stock movement, and AuditLog tracks all system activity.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A MySQL database, either local or cloud-hosted

### Installation

```bash
# Clone the repository
git clone https://github.com/axelzarraa/inventra-inventory-management.git
cd inventra-inventory-management

# Install dependencies
npm install

# Set up environment variables
# Create a .env file and fill in your DATABASE_URL and JWT_SECRET

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

This project is deployed using Vercel for the Next.js application and Railway for the MySQL database. The following environment variables are required on Vercel:

```env
DATABASE_URL=mysql://...
JWT_SECRET=your-secret-key
```

## What I Learned

Building Inventra gave me hands-on experience with fullstack architecture using Next.js App Router, ORM-based database management with Prisma v7, implementing JWT authentication with role-based access control, connecting and deploying a cloud MySQL database on Railway, and managing a full production deployment workflow with Vercel and GitHub.

## Author

**Axel Zarra Setya Budi**
- GitHub: [@axelzarraa](https://github.com/axelzarraa)
- LinkedIn: [Axel Zarra Setya Budi](https://www.linkedin.com/in/axel-zarra-setya-budi-a18626281/)