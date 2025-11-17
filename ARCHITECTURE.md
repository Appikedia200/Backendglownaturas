# Clean Architecture Backend - GlowNatura

## Architecture Overview

This backend follows **Clean Architecture** principles with clear separation of concerns across 4 layers:

### 1. Domain Layer (src/domain/)
- **Entities**: Core business objects
- **Repositories**: Interface definitions (ports)
- **Services**: Business service interfaces
- **Value Objects**: Immutable domain values (Money, Email, OrderStatus)

### 2. Application Layer (src/application/)
- **Use Cases**: Business logic orchestration
- **DTOs**: Data transfer objects

### 3. Infrastructure Layer (src/infrastructure/)
- **Database**: MongoDB repositories (adapters)
- **Services**: External service implementations (Brevo, Cloudinary)
- **Config**: Centralized configuration management

### 4. Presentation Layer (src/presentation/)
- **Controllers**: Thin HTTP handlers
- **Routes**: Express route definitions
- **Validators**: Input validation schemas
- **Middleware**: Error handling, authentication

## Design Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: No code duplication
- **Dependency Injection**: Constructor injection throughout
- **Repository Pattern**: All data access abstracted
- **Clean Architecture**: Framework-independent business logic

## Project Structure

`
src/
├── domain/              # Core business logic (framework-independent)
├── application/         # Use cases / application logic
├── infrastructure/      # External concerns (database, services)
├── presentation/        # HTTP layer (controllers, routes, validators)
├── shared/             # Shared utilities (errors, response, pagination)
└── di/                 # Dependency injection container
`

## Legacy Code

The following folders contain legacy code that will be gradually migrated:
- src/controllers/ - Old controllers (use src/presentation/http/controllers/)
- src/routes/ - Old routes (use src/presentation/http/routes/)
- src/validators/ - Old validators (use src/presentation/http/validators/)
- src/utils/ - Old utilities (use src/shared/utils/)

## API Endpoints

### New Clean Architecture Endpoints
- GET /api/products - Get all products (with pagination & validation)
- POST /api/products - Create product (protected, validated)
- GET /api/orders - Get all orders (protected, validated)
- POST /api/orders - Create order (protected, validated)
- GET /api/categories - Get all categories (validated)
- GET /api/reviews - Get all reviews (validated)

### Legacy Endpoints (Still Active)
- /api/auth/* - Authentication
- /api/media/* - Media management
- /api/dashboard/* - Dashboard statistics
- /api/settings/* - Settings management

## Running the Application

`ash
# Install dependencies
npm install

# Start server
npm start

# Development mode
npm run dev
`

## Environment Variables

See .env file for required configuration.

## Version

5.1.0 - Clean Architecture Refactoring Complete
