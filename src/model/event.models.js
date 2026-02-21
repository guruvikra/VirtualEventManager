import { v4 as uuid } from 'uuid';

const events = []


export function createEvent({ title, description, date, time, organizer }) {
    const event = {
        id: uuid(),
        title,
        description,
        date,
        time,
        organizer,
        participants: []
    }
    events.push(event);
    return event;
}


export function getAllEvents() {
    return events;
}

export function getEventById(id) {
    return events.find((event) => {
        return event.id === id
    })
}

export function deleteEvent(id) {
    const index = events.findIndex((event) => {
        return event.id === id
    })

    if (index === -1) {
        throw new Error("Event not found");
    }

    events.splice(index, 1);
    return true;
}

export function updateEvent(id, updates) {
    const index = events.findIndex((event) => {
        return event.id === id
    })

    if (index === -1) {
        throw new Error("Event not found");
    }

    // Only overwrite fields that are actually provided (not undefined)
    const { title, description, date, time } = updates;
    if (title !== undefined) events[index].title = title;
    if (description !== undefined) events[index].description = description;
    if (date !== undefined) events[index].date = date;
    if (time !== undefined) events[index].time = time;

    return events[index];
}

export function addParticipant(eventId, userId) {
    const event = getEventById(eventId);
    if (!event) throw new Error("Event not found");
    if (event.participants.includes(userId)) throw new Error("Already registered");
    event.participants.push(userId);
    return event;
}

export function removeParticipant(eventId, userId) {
    const event = getEventById(eventId);
    if (!event) throw new Error("Event not found");
    if (!event.participants.includes(userId)) throw new Error("Not registered");
    event.participants = event.participants.filter((id) => id !== userId);
    return event;
}

export function getEventsByParticipant(userId) {
    return events.filter((event) => event.participants.includes(userId));
}
