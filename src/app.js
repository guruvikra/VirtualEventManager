import express from "express";
import userRoutes from "./routes/user.route.js";
import eventRoutes from "./routes/event.route.js";

const app = express();

app.use(express.json());

// Mount user routes at root level to match spec: POST /register, POST /login
app.use("/", userRoutes);
app.use("/events", eventRoutes);

app.get("/test", (req, res) => {
    res.send("Working......");
});


export { app }