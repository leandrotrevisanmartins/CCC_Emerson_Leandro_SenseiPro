import express, { Application } from "express";
import cors from "cors";
import router from "./routes/index";
import errorHandler from "./middleware/errorHandler";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api", router);

app.use(errorHandler);

export default app;
