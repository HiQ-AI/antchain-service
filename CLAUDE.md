# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server with hot reload
deno task dev

# Start production server
deno task start

# Run tests
deno test --allow-read --allow-net --allow-env

# Lint code
deno lint

# Format code
deno fmt

# Type check
deno check main.ts
```

### Docker
```bash
# Build Docker image
docker build -t antchain-dev .

# Run container
docker run -p 8080:8080 -p 22:22 --name antchain-service antchain-dev
```

## Architecture

This is a blockchain API service built with Deno and Hono, following a four-layer architecture:

```
Routes → Middlewares → Services → Core
```

### Layer Responsibilities

1. **Routes Layer** (`/src/routes/`): HTTP endpoints and request/response handling
   - `/api/auth` - Authentication endpoints
   - `/api/admin` - Admin operations (requires auth)
   - `/api/node` - Node operations (requires auth)

2. **Middlewares Layer** (`/src/middlewares/`): Pure HTTP concerns
   - `authMiddleware.ts` - JWT token validation
   - `errorHandler.ts` - Global error handling
   - `logger.ts` - Request/response logging

3. **Services Layer** (`/src/services/`): Business logic orchestration
   - `BlockchainService.ts` - Unified interface for all blockchain operations
   - Combines core functions into cohesive business operations

4. **Core Layer** (`/src/core/blockchain/`): Core blockchain logic
   - `auth/` - Blockchain authentication
   - `contract/` - Smart contract operations
   - `data/` - Data storage and retrieval
   - `privacy/` - Privacy computing tasks

### Key Patterns

- **Dependency Injection**: Services receive core modules as dependencies
- **Error Handling**: Custom error types with proper HTTP status codes
- **Configuration**: Environment-based config in `/src/config/`
- **Authentication**: JWT tokens for API authentication

## Testing

API testing files are located in `/test/` directory as `.http` files. Use these for manual API testing during development.

## Important Notes

- This is a Deno project (not Node.js) - use Deno commands and APIs
- Dependencies are managed through `deno.json` import maps
- The project uses AntChain blockchain libraries (`@antchain/mychain`, `@antchain/myassembly`)
- Sensitive files like certificates are in `/certs/` (gitignored)
- Environment configuration follows a modular pattern in `/src/config/`