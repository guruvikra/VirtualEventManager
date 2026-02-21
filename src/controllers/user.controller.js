import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createUser, getAllUsers, findByEmail } from '../model/user.model.js'



export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

        return res.status(200).json({ message: "Login successful", token })


    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export async function registerUser(req, res) {
    try {
        const { name, email, password, role } = req.body
        const user = await createUser({ name, email, password, role })
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
        return res.status(201).json({ message: "User registered successfully", token })
    }
    catch (error) {
        if (error.message === "Name, email, and password are required") {
            return res.status(400).json({ error: error.message })
        }
        if (error.message === "User already exists") {
            return res.status(409).json({ error: error.message })
        }
        return res.status(500).json({ error: error.message })
    }
}

export function getUsers(req, res) {
    try {
        const users = getAllUsers()
        return res.status(200).json({ message: "Users fetched successfully", users })
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
