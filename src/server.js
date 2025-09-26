import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import * as process from "node:process";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swaggerConfig.js";
import authRouter from "./routes/authentication.router.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
dotenv.config();
//app config

const app = express();
const port = process.env.PORT || 8001;
mongoose.set("strictQuery", true);

//middlewares
app.use(express.json());
app.use(cors());

//db config
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error: ", err));

//api endpoints
app.use("/api/user", authRouter);
// app.use("/api/shifts", shiftsRouter);
// Swagger Docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandlerMiddleware);

//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));
