import env from "./config/env";

import cors from "cors";

import express from "express";

import path from "path";

import { errorHandler } from "./middleware/errorHandler";

import userRoutes from "./routes/userRoutes";

import adminRoutes from "./routes/adminRoutes";

import categoryRoutes from "./routes/categoryRoutes";

import adminProductRoutes from "./routes/adminProductRoutes";

import userProductRoutes from "./routes/userProductRoutes";

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

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/admin/products", adminProductRoutes);

app.use("/api/v1/products", userProductRoutes);

app.get("/api/health", (_, res) => {
  res.json({ status: "___I'm yours to command.___" });
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
