import env from "./config/env";

import cors from "cors";

import express from "express";

import { errorHandler } from "./middleware/errorHandler";

import userRoutes from "./routes/userRoutes";

import adminRoutes from "./routes/adminRoutes";

import categoryRoutes from "./routes/categoryRoutes";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.get("/api/health", (_, res) => {
  res.json({ status: "Server is running" });
});

app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
