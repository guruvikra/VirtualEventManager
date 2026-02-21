import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

const users = [];

export function findByEmail(email) {
    return users.find((user) => {
        return user.email === email
    })
}

export async function createUser({ name, email, password, role }) {
    let existing = findByEmail(email);

    if (existing != null) {
        throw new Error("User already exists");
    }

    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
    }

    let userRole = "attendee";

    if (role === "organizer") {
        userRole = "organizer";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: uuid(),
        name,
        email,
        password: hashedPassword,
        role: userRole
    }

    users.push(user);
    return user;
}

export function getAllUsers() {
    return users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
}

export function findById(id) {
    return users.find((user) => {
        return user.id === id
    })
}

export function deleteUser(id) {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index === -1) {
        throw new Error("User not found");
    }

    users.splice(index, 1);
    return true;
}