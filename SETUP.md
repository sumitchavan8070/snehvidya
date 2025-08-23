# School Management System - Setup Guide

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn
- MySQL (version 8.0 or higher)
- Git

## Installation Steps

### 1. Clean Installation

First, clean up any existing node_modules and package-lock.json:

\`\`\`bash
rm -rf node_modules package-lock.json
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

If you encounter any issues, try:

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Update the environment variables:

\`\`\`env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=School Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

### 4. Database Setup

#### Install MySQL (if not already installed)

**On macOS:**
\`\`\`bash
brew install mysql
brew services start mysql
\`\`\`

**On Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
\`\`\`

#### Create Database

\`\`\`bash
mysql -u root -p
\`\`\`

\`\`\`sql
CREATE DATABASE school_management_system;
CREATE USER 'school_admin'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON school_management_system.* TO 'school_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
\`\`\`

### 5. Backend Setup

Navigate to the backend directory:

\`\`\`bash
cd backend
\`\`\`

Install backend dependencies:

\`\`\`bash
npm install
\`\`\`

Create backend environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your database credentials:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=school_admin
DB_PASSWORD=your_password
DB_DATABASE=school_management_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3001
\`\`\`

Run database migrations:

\`\`\`bash
npm run migration:run
\`\`\`

Seed the database:

\`\`\`bash
npm run seed
\`\`\`

### 6. Running the Application

#### Start the Backend (in backend directory)

\`\`\`bash
npm run start:dev
\`\`\`

The backend will run on http://localhost:3001

#### Start the Frontend (in root directory)

\`\`\`bash
npm run dev
\`\`\`

The frontend will run on http://localhost:3000

## Default Login Credentials

After seeding the database, you can use these credentials:

**Principal:**
- Email: principal@school.com
- Password: password123

**Teacher:**
- Email: teacher@school.com
- Password: password123

**Student:**
- Email: student@school.com
- Password: password123

## Troubleshooting

### Common Issues

1. **"next: command not found"**
   - Make sure Next.js is installed: `npm install next`
   - Try running with npx: `npx next dev`

2. **"pg_config: command not found"**
   - This project uses MySQL, not PostgreSQL
   - If you see this error, clean node_modules and reinstall

3. **Database connection issues**
   - Make sure MySQL is running
   - Check your database credentials in .env
   - Ensure the database exists

4. **Port already in use**
   - Frontend: Change port with `npm run dev -- -p 3001`
   - Backend: Update PORT in .env file

### Clean Reinstall

If you're still having issues:

\`\`\`bash
# Clean everything
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstall
npm install
cd backend && npm install
\`\`\`

## Project Structure

\`\`\`
school-management-admin/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utility functions
├── backend/               # NestJS backend
│   ├── src/              # Source code
│   └── database/         # Database files
├── public/               # Static files
└── styles/               # CSS files
\`\`\`

## Development Workflow

1. Start MySQL service
2. Start backend: `cd backend && npm run start:dev`
3. Start frontend: `npm run dev`
4. Access application at http://localhost:3000

## Production Deployment

See DEPLOYMENT.md for production setup instructions.
\`\`\`

\`\`\`plaintext file=".env.local.example"
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=School Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
