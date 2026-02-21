import { jest } from '@jest/globals';
import dotenv from 'dotenv';

dotenv.config();

// Mock emailService before importing app
jest.unstable_mockModule('../src/utils/emailService.js', () => ({
    sendRegistrationEmail: jest.fn().mockResolvedValue(true)
}));

const { default: request } = await import('supertest');
const { app } = await import('../src/app.js');

let organizerToken;
let attendeeToken;
let eventId;

// ─── USER REGISTRATION ──────────────────────────────────────────────

describe('POST /register', () => {
    it('should register an organizer and return a token', async () => {
        const res = await request(app)
            .post('/register')
            .send({ name: 'Organizer', email: 'org@test.com', password: 'pass123', role: 'organizer' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.token).toBeDefined();
        organizerToken = res.body.token;
    });

    it('should register an attendee and return a token', async () => {
        const res = await request(app)
            .post('/register')
            .send({ name: 'Attendee', email: 'att@test.com', password: 'pass123', role: 'attendee' });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        attendeeToken = res.body.token;
    });

    it('should default role to attendee if not specified', async () => {
        const res = await request(app)
            .post('/register')
            .send({ name: 'Default', email: 'default@test.com', password: 'pass123' });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Name, email, and password are required');
    });

    it('should return 409 if user already exists', async () => {
        const res = await request(app)
            .post('/register')
            .send({ name: 'Organizer', email: 'org@test.com', password: 'pass123', role: 'organizer' });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('User already exists');
    });
});

// ─── USER LOGIN ──────────────────────────────────────────────────────

describe('POST /login', () => {
    it('should login with valid credentials and return a token', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'org@test.com', password: 'pass123' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();
    });

    it('should return 400 if email or password missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'org@test.com' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email and password are required');
    });

    it('should return 404 if user not found', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'nonexistent@test.com', password: 'pass123' });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('User not found');
    });

    it('should return 401 for invalid password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: 'org@test.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid password');
    });
});

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────

describe('Auth Middleware', () => {
    it('should return 401 if no token provided', async () => {
        const res = await request(app).get('/events');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No token provided');
    });

    it('should return 401 for an invalid token', async () => {
        const res = await request(app)
            .get('/events')
            .set('Authorization', 'Bearer invalidtoken123');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Unauthorized');
    });
});

// ─── EVENT CREATION ──────────────────────────────────────────────────

describe('POST /events', () => {
    it('should allow organizer to create an event', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ title: 'Tech Talk', description: 'A talk on Node.js', date: '2026-03-01', time: '10:00' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Event created successfully');
        expect(res.body.event).toBeDefined();
        expect(res.body.event.title).toBe('Tech Talk');
        expect(res.body.event.participants).toEqual([]);
        eventId = res.body.event.id;
    });

    it('should return 403 if attendee tries to create event', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${attendeeToken}`)
            .send({ title: 'Talk', description: 'desc', date: '2026-03-01', time: '10:00' });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Only organizers can create events');
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ title: 'Incomplete Event' });

        expect(res.status).toBe(400);
    });
});

// ─── GET EVENTS ──────────────────────────────────────────────────────

describe('GET /events', () => {
    it('should return all events', async () => {
        const res = await request(app)
            .get('/events')
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.events).toBeInstanceOf(Array);
        expect(res.body.events.length).toBeGreaterThanOrEqual(1);
    });
});

describe('GET /events/:id', () => {
    it('should return a specific event', async () => {
        const res = await request(app)
            .get(`/events/${eventId}`)
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.event.id).toBe(eventId);
    });

    it('should return 404 for non-existent event', async () => {
        const res = await request(app)
            .get('/events/non-existent-id')
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(404);
    });
});

// ─── UPDATE EVENT ────────────────────────────────────────────────────

describe('PUT /events/:id', () => {
    it('should allow organizer to update their own event', async () => {
        const res = await request(app)
            .put(`/events/${eventId}`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ title: 'Updated Tech Talk' });

        expect(res.status).toBe(200);
        expect(res.body.event.title).toBe('Updated Tech Talk');
        // Other fields should still be intact (partial update)
        expect(res.body.event.description).toBe('A talk on Node.js');
    });

    it('should return 403 if attendee tries to update event', async () => {
        const res = await request(app)
            .put(`/events/${eventId}`)
            .set('Authorization', `Bearer ${attendeeToken}`)
            .send({ title: 'Hacked' });

        expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent event', async () => {
        const res = await request(app)
            .put('/events/non-existent-id')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ title: 'Nope' });

        expect(res.status).toBe(404);
    });
});

// ─── PARTICIPANT REGISTRATION ────────────────────────────────────────

describe('POST /events/:id/register', () => {
    it('should allow attendee to register for an event', async () => {
        const res = await request(app)
            .post(`/events/${eventId}/register`)
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Event registered successfully');
    });

    it('should return 409 if attendee is already registered', async () => {
        const res = await request(app)
            .post(`/events/${eventId}/register`)
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Already registered');
    });

    it('should return 403 if organizer tries to register as attendee', async () => {
        const res = await request(app)
            .post(`/events/${eventId}/register`)
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Only attendees can register for events');
    });

    it('should return 404 for non-existent event', async () => {
        const res = await request(app)
            .post('/events/non-existent-id/register')
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(404);
    });
});

// ─── MY REGISTRATIONS ───────────────────────────────────────────────

describe('GET /events/my-registrations', () => {
    it('should return events the user is registered for', async () => {
        const res = await request(app)
            .get('/events/my-registrations')
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(200);
        expect(res.body.events).toBeInstanceOf(Array);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].id).toBe(eventId);
    });
});

// ─── UNREGISTER FROM EVENT ───────────────────────────────────────────

describe('DELETE /events/:id/register', () => {
    it('should allow attendee to unregister from an event', async () => {
        const res = await request(app)
            .delete(`/events/${eventId}/register`)
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Successfully unregistered from event');
    });

    it('should return 400 if not registered', async () => {
        const res = await request(app)
            .delete(`/events/${eventId}/register`)
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Not registered');
    });
});

// ─── DELETE EVENT ────────────────────────────────────────────────────

describe('DELETE /events/:id', () => {
    it('should return 403 if attendee tries to delete event', async () => {
        const res = await request(app)
            .delete(`/events/${eventId}`)
            .set('Authorization', `Bearer ${attendeeToken}`);

        expect(res.status).toBe(403);
    });

    it('should allow organizer to delete their own event', async () => {
        const res = await request(app)
            .delete(`/events/${eventId}`)
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Event deleted successfully');
    });

    it('should return 404 after event is deleted', async () => {
        const res = await request(app)
            .get(`/events/${eventId}`)
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(404);
    });
});
