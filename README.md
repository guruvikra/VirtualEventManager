# Virtual Event Manager

A RESTful backend system for managing virtual events, built with Node.js and Express.js. Supports user authentication, event CRUD operations, and participant management — all using in-memory data structures.

## Features

- **User Authentication** — Register and login with bcrypt password hashing and JWT tokens.
- **Role-Based Access** — Organizers create/update/delete events; attendees register for events.
- **Event Management** — Full CRUD for events (title, description, date, time, participants).
- **Participant Management** — Attendees can register/unregister for events and view their registrations.
- **Email Notifications** — Confirmation email sent on event registration via Nodemailer.
- **In-Memory Storage** — No database required; all data stored in arrays.

## Tech Stack

- Node.js, Express.js
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- Nodemailer (email)
- uuid (unique IDs)
- Jest + Supertest (testing)

## Getting Started

### Prerequisites

- Node.js v18+

### Installation

```bash
git clone https://github.com/guruvikra/VirtualEventManager.git
cd VirtualEventManager
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Run the Server

```bash
npm run dev
```

### Run Tests

```bash
npm run test
```

## API Endpoints

### Authentication

| Method | Endpoint    | Description         | Auth Required |
| ------ | ----------- | ------------------- | ------------- |
| POST   | `/register` | Register a new user | No            |
| POST   | `/login`    | Login and get token | No            |

### Events

| Method | Endpoint                   | Description                  | Auth Required | Role      |
| ------ | -------------------------- | ---------------------------- | ------------- | --------- |
| GET    | `/events`                  | List all events              | Yes           | Any       |
| GET    | `/events/:id`              | Get event by ID              | Yes           | Any       |
| GET    | `/events/my-registrations` | Get user's registered events | Yes           | Any       |
| POST   | `/events`                  | Create a new event           | Yes           | Organizer |
| PUT    | `/events/:id`              | Update an event              | Yes           | Organizer |
| DELETE | `/events/:id`              | Delete an event              | Yes           | Organizer |
| POST   | `/events/:id/register`     | Register for an event        | Yes           | Attendee  |
| DELETE | `/events/:id/register`     | Unregister from an event     | Yes           | Attendee  |

### Request/Response Examples

**Register:**

```json
POST /register
Body: { "name": "Alice", "email": "alice@test.com", "password": "pass123", "role": "organizer" }
Response: { "message": "User registered successfully", "token": "jwt_token_here" }
```

**Create Event:**

```json
POST /events
Headers: { "Authorization": "Bearer <token>" }
Body: { "title": "Tech Talk", "description": "A talk on Node.js", "date": "2026-03-01", "time": "10:00" }
Response: { "message": "Event created successfully", "event": { ... } }
```

**Register for Event:**

```json
POST /events/:id/register
Headers: { "Authorization": "Bearer <token>" }
Response: { "message": "Event registered successfully" }
```

## Project Structure

```
src/
├── index.js                  # Entry point, starts server
├── app.js                    # Express app setup and route mounting
├── controllers/
│   ├── user.controller.js    # Register, login, get users
│   └── event.controller.js   # Event CRUD + participant management
├── model/
│   ├── user.model.js         # In-memory user store
│   └── event.models.js       # In-memory event store
├── routes/
│   ├── user.route.js         # Auth routes
│   └── event.route.js        # Event routes
├── middlewares/
│   └── auth.middleware.js    # JWT verification middleware
└── utils/
    └── emailService.js       # Nodemailer email utility
tests/
└── app.test.js               # API integration tests
```

## License

ISC
