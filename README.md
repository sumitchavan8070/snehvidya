# School Management System

A comprehensive school management system built with Next.js (frontend) and NestJS (backend), featuring role-based access control, attendance management, fee tracking, and more.

## Features

### 🎯 Core Features
- **Multi-role Authentication** (Admin, Principal, Teacher, Student, Parent)
- **Dashboard Analytics** with real-time statistics
- **User Management** with role-based permissions
- **School Management** for multi-school support

### 📚 Academic Management
- **Class & Subject Management**
- **Timetable Scheduling**
- **Assignment Management** with submissions and grading
- **Attendance Tracking** for both staff and students

### 💰 Financial Management
- **Fee Management** with multiple categories
- **Payment Tracking** with receipt generation
- **Salary Management** for staff
- **Financial Reports** and analytics

### 📋 Administrative Features
- **Leave Management** for staff and students
- **Notification System** with real-time alerts
- **Report Generation** with various filters
- **Audit Logging** for system activities

### 🔧 Technical Features
- **RESTful API** with comprehensive documentation
- **Database Integration** with MySQL
- **Docker Support** for easy deployment
- **Responsive Design** for all devices
- **Real-time Updates** and notifications

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Hook Form** for form management
- **Recharts** for data visualization

### Backend
- **NestJS** with TypeScript
- **TypeORM** for database management
- **MySQL** database
- **JWT** authentication
- **Swagger** API documentation
- **bcrypt** for password hashing

### DevOps
- **Docker** containerization
- **Docker Compose** for multi-service setup
- **Environment-based** configuration

## Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Docker (optional)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd school-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm run setup
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   \`\`\`
   Update the environment variables with your database credentials.

4. **Set up the database**
   \`\`\`bash
   # Create database and run migrations
   mysql -u root -p &lt; database/schema.sql
   mysql -u root -p &lt; database/seeders.sql
   \`\`\`

5. **Start the development servers**
   \`\`\`bash
   # Start both frontend and backend
   npm run dev:all
   
   # Or start individually
   npm run backend:dev  # Backend on port 3001
   npm run dev          # Frontend on port 3000
   \`\`\`

### Using Docker

1. **Start with Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | password |
| Principal | principal@school.com | password |
| Teacher | teacher@school.com | password |
| Student | student@school.com | password |

## API Documentation

The API documentation is available at `/api/docs` when the backend is running. It includes:
- Authentication endpoints
- User management
- Academic management
- Financial operations
- Administrative functions

## Project Structure

\`\`\`
school-management-system/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes (if needed)
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── entities/      # Database entities
│   │   ├── modules/       # Feature modules
│   │   └── main.ts        # Application entry point
│   └── Dockerfile
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── app-sidebar.tsx   # Main sidebar component
├── database/             # Database files
│   ├── schema.sql        # Database schema
│   └── seeders.sql       # Sample data
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── docker-compose.yml    # Docker configuration
\`\`\`

## Database Schema

The system uses a comprehensive MySQL database with the following main entities:
- Users (with role-based access)
- Schools and Classes
- Subjects and Timetables
- Attendance records
- Fee management
- Assignments and submissions
- Notifications
- Audit logs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the database schema in `database/schema.sql`

## Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Parent portal enhancements
\`\`\`

```plaintext file=".gitignore"
# Dependencies
node_modules/
backend/node_modules/

# Production builds
.next/
backend/dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
backend/.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# Database
*.sqlite
*.db

# Uploads
uploads/
public/uploads/
