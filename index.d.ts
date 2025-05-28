import { Request } from "express";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userID?: string | mongoose.Types.ObjectId;
    }
  }
}