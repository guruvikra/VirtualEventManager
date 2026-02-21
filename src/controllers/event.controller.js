import { createEvent, getAllEvents, getEventById, deleteEvent, updateEvent, addParticipant, removeParticipant, getEventsByParticipant } from '../model/event.models.js'
import { sendRegistrationEmail } from '../utils/emailService.js';


export function registerEvent(req, res) {
    try {
        const { title, description, date, time } = req.body;

        if (!title || !description || !date || !time) {
            return res.status(400).json({ error: "All fields are required (title, description, date, time)" });
        }

        const user = req.user;

        if (user.role !== 'organizer') {
            return res.status(403).json({ error: "Only organizers can create events" });
        }

        const event = createEvent({ title, description, date, time, organizer: user.id });
        return res.status(201).json({ message: "Event created successfully", event });

    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export async function registerForEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 'attendee') {
            return res.status(403).json({ error: "Only attendees can register for events" });
        }

        const event = addParticipant(id, user.id);
        await sendRegistrationEmail(user.email, event.title);

        return res.status(200).json({ message: "Event registered successfully" });
    }
    catch (error) {
        if (error.message === "Event not found") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === "Already registered") {
            return res.status(409).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message })
    }
}

export function unregisterFromEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;

        removeParticipant(id, user.id);
        return res.status(200).json({ message: "Successfully unregistered from event" });
    }
    catch (error) {
        if (error.message === "Event not found") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === "Not registered") {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message })
    }
}

export function getMyRegistrations(req, res) {
    try {
        const user = req.user;
        const events = getEventsByParticipant(user.id);
        return res.status(200).json({ message: "Your registered events", events });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


export function getEvents(req, res) {
    try {
        const events = getAllEvents();
        return res.status(200).json({ message: "Events fetched successfully", events });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


export function getEvent(req, res) {
    try {
        const { id } = req.params;
        const event = getEventById(id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        return res.status(200).json({ message: "Event fetched successfully", event });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


export function removeEvent(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 'organizer') {
            return res.status(403).json({ error: "Only organizers can delete events" });
        }

        const event = getEventById(id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.organizer !== user.id) return res.status(403).json({ error: "You can only delete your own events" });

        deleteEvent(id);
        return res.status(200).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


export function editEvent(req, res) {
    try {
        const { id } = req.params;
        const { title, description, date, time } = req.body;
        const user = req.user;

        if (user.role !== 'organizer') {
            return res.status(403).json({ error: "Only organizers can update events" });
        }

        const existing = getEventById(id);
        if (!existing) return res.status(404).json({ error: "Event not found" });
        if (existing.organizer !== user.id) return res.status(403).json({ error: "You can only update your own events" });

        const event = updateEvent(id, { title, description, date, time });
        return res.status(200).json({ message: "Event updated successfully", event });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
