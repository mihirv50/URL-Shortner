import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use("/api/V1", userRouter);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
