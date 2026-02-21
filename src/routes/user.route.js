import { Router } from 'express'
import { registerUser, getUsers, loginUser } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const route = Router();

route.get("/", authMiddleware, getUsers);
route.post("/register", registerUser);
route.post("/login", loginUser);

export default route;