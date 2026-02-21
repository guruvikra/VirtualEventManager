import { Router } from 'express'
import { registerEvent, getEvents, getEvent, removeEvent, editEvent, registerForEvent, unregisterFromEvent, getMyRegistrations } from '../controllers/event.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const route = Router();

route.get("/", authMiddleware, getEvents);
route.get("/my-registrations", authMiddleware, getMyRegistrations);
route.get("/:id", authMiddleware, getEvent);
route.post("/", authMiddleware, registerEvent);
route.put("/:id", authMiddleware, editEvent);
route.delete("/:id", authMiddleware, removeEvent);
route.post("/:id/register", authMiddleware, registerForEvent);
route.delete("/:id/register", authMiddleware, unregisterFromEvent);

export default route;