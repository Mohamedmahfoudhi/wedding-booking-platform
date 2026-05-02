# WeddingBook - Wedding Services Booking Platform

A comprehensive marketplace platform connecting wedding service providers with customers in Tunisia. Features a dual-purpose architecture combining a SaaS provider dashboard with a public marketplace.

## Features

### For Customers (Marketplace)
- Browse wedding services by category (Venues, Photographers, Caterers, etc.)
- Search with filters (location, price, rating, availability)
- View service details with photo galleries
- Book services and pay online
- Message providers directly
- Leave reviews after completed bookings
- Save favorite services

### For Providers (SaaS Dashboard)
- Manage business profile and services
- Set availability and blocked dates
- Handle booking requests (confirm/reject)
- View calendar with upcoming events
- Respond to customer reviews
- Track revenue and payouts
- Receive payments via Stripe Connect

### For Admins
- Dashboard with platform statistics
- User and provider management
- Service moderation (approve/reject)
- Category management
- View all bookings and payments

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| UI Library | PrimeReact + PrimeFlex |
| State Management | Redux Toolkit |
| Backend | NestJS (Node.js) |
| Database | PostgreSQL |
| ORM | TypeORM |
| Authentication | JWT (Access + Refresh tokens) |
| Payments | Stripe Connect |
| File Storage | Cloudinary |
| Real-time | Socket.IO |

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** or **yarn**

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd wedding-booking-platform
```

### 2. Set up PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE wedding_platform;

# Exit
\q
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wedding_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe (get keys from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary (get keys from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

Start the backend:

```bash
npm run start:dev
```

### 4. Frontend Setup

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_CLOUDINARY_CLOUD_NAME=your-cloud
```

Start the frontend:

```bash
npm run dev
```

## Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| API Docs (Swagger) | http://localhost:3000/api/docs |

## Project Structure

```
wedding-booking-platform/
├── backend/                    # NestJS REST API
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── common/            # Guards, decorators, filters
│   │   │   ├── guards/        # JWT, Role guards
│   │   │   ├── decorators/    # Custom decorators
│   │   │   ├── filters/       # Exception filters
│   │   │   └── interceptors/  # Response transformers
│   │   ├── database/
│   │   │   └── entities/      # TypeORM entities (17 entities)
│   │   └── modules/           # Feature modules (14 modules)
│   │       ├── auth/          # Authentication
│   │       ├── users/         # User management
│   │       ├── providers/     # Provider profiles
│   │       ├── categories/    # Service categories
│   │       ├── services/      # Service CRUD
│   │       ├── availability/  # Calendar & scheduling
│   │       ├── bookings/      # Booking workflow
│   │       ├── payments/      # Stripe integration
│   │       ├── reviews/       # Ratings & reviews
│   │       ├── favorites/     # Wishlists
│   │       ├── messages/      # Chat system
│   │       ├── notifications/ # In-app alerts
│   │       ├── upload/        # File uploads
│   │       └── admin/         # Admin operations
│   └── package.json
│
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── api/               # API client with Axios
│   │   ├── components/        # Reusable UI components
│   │   ├── layouts/           # Page layouts (4 layouts)
│   │   ├── pages/             # Route pages (25 pages)
│   │   │   ├── public/        # Marketplace pages
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── client/        # Client dashboard
│   │   │   ├── provider/      # Provider dashboard
│   │   │   └── admin/         # Admin panel
│   │   ├── store/             # Redux store & slices
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Helper functions
│   └── package.json
│
├── DEVELOPMENT_ROADMAP.md     # Development progress tracking
└── README.md                  # This file
```

## Available Scripts

### Backend

```bash
npm run start:dev    # Start development server with hot reload
npm run start:prod   # Start production server
npm run build        # Build for production
npm run test         # Run tests
npm run migration:run    # Run database migrations
npm run migration:generate  # Generate new migration
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Service Categories

The platform supports the following wedding service categories:

- Salles des Fêtes (Venues)
- Photographes (Photographers)
- Voitures de Mariage (Wedding Cars)
- Notaires (Notaries)
- Coiffeurs (Hair Stylists)
- Robes & Costumes (Dresses & Suits)
- Bands & DJ
- Décorations (Decorations)
- Traiteurs (Caterers)
- Gâteaux (Cakes)
- Fleuristes (Florists)

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List services (with filters)
- `GET /api/services/:id` - Get service details
- `POST /api/provider/services` - Create service (provider)
- `PATCH /api/provider/services/:id` - Update service

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List my bookings
- `POST /api/provider/bookings/:id/confirm` - Confirm booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/webhooks/stripe` - Stripe webhook

## Development Roadmap

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for detailed progress tracking.

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Foundation | ✅ Completed |
| Phase 2 | Authentication System | 🔲 Pending |
| Phase 3 | User & Provider Management | 🔲 Pending |
| Phase 4 | Categories & Services | 🔲 Pending |
| Phase 5-14 | Remaining features | 🔲 Pending |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email contact@weddingbook.tn or open an issue in the repository.
