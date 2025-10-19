# DataVid Celebration Planner API

A clean, well-structured TypeScript/Express API for managing team member birthdays and celebrations.

## Architecture

This project follows a layered architecture pattern with clear separation of concerns:

```
src/
├── config/           # Environment configuration
├── common/           # Shared utilities (errors, validation)
├── db/               # Database client initialization
├── models/           # TypeScript interfaces and DTOs
├── repositories/     # Data access layer (Prisma queries)
├── services/         # Business logic layer
├── controllers/      # Request/response handling
├── routes/           # Route definitions
├── utils/            # Helper functions (date utils, validation schemas)
├── middlewares/      # Express middlewares
└── modules/          # Legacy AI & Email providers (to be refactored)
```

## Layer Responsibilities

### Models (`src/models/`)
- Define TypeScript interfaces for domain entities
- Define DTOs (Data Transfer Objects) for requests/responses
- No business logic

### Repositories (`src/repositories/`)
- Handle all database access through Prisma
- Provide clean CRUD operations
- Abstract database implementation from business logic
- Return domain models

### Services (`src/services/`)
- Contain business logic
- Use repositories for data access
- Handle validation and business rules
- Orchestrate operations across multiple repositories

### Controllers (`src/controllers/`)
- Handle HTTP request/response
- Validate request data (using Zod schemas)
- Call appropriate services
- Format responses
- Handle errors via middleware

### Routes (`src/routes/`)
- Define API endpoints
- Map HTTP methods to controller actions
- Apply middleware (rate limiting, authentication, etc.)

### Utils (`src/utils/`)
- Reusable helper functions
- Validation schemas
- Date/time utilities

## API Endpoints

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Birthdays
- `GET /api/birthdays/upcoming?days=30` - Get upcoming birthdays
- `GET /api/birthdays/today` - Get today's birthdays

### AI Messages
- `POST /api/ai/message` - Generate birthday message (rate-limited)

## Getting Started

### Prerequisites
- Node.js 18+
- SQLite (no configuration needed)

### Installation
```bash
npm install
```

### Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
CORS_ORIGIN=http://localhost:4200
DATABASE_URL="file:./dev.db"

# AI
AI_PROVIDER=mock
OPENAI_API_KEY=

# Email
EMAIL_PROVIDER=console
EMAIL_DRY_RUN=true
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Datavid Planner <no-reply@datavid.test>"
```

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express 5
- **Database:** SQLite via Prisma ORM
- **Validation:** Zod
- **Date/Time:** Luxon
- **Security:** Helmet, CORS, express-rate-limit
- **Email:** Nodemailer
- **Dev Tools:** ts-node-dev

## Code Quality

- **Type Safety:** Full TypeScript coverage
- **Validation:** All inputs validated with Zod
- **Error Handling:** Centralized error middleware
- **Security:** Helmet, CORS, rate limiting
- **Clean Code:** Separation of concerns, dependency injection

## Future Improvements

- [ ] Refactor AI and Email modules to follow new architecture
- [ ] Add authentication/authorization middleware
- [ ] Add unit tests with Jest
- [ ] Add integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add logging service (Winston)
- [ ] Add caching layer (Redis)
