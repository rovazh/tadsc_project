## Projekt z przedmiotu Tworzenie aplikacji dla środowisk chmurowych

## How to run

Create .env file in the project root directory using .env.dist as a template and 
execute ```docker compose up``` in the project root directory.

The docker-compose will run MongoDB + 3 API services (user-api,
auction-api, payment-api).

## API Services

Each service listens to its own port and can be accessed
from the host machine via http://localhost:{port}

### User API service
- Port 3000
- Swagger docs URL http://localhost:3000/api-docs

### Auction API service
- Port 3001
- Swagger docs URL http://localhost:3001/api-docs

### Payment API service
- Port 3002
- Swagger docs URL http://localhost:3002/api-docs

## Authentication
Each service uses the bearer token authentication.
AWS Cognito is configured as the OAuth 2.0 provider (Client Credentials flow).
To authorize in Swagger, please use the `client_id` and `client_secret` provided to you privately.
