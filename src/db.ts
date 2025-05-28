import dotenv from "dotenv";
dotenv.config();
import mongoose, { Schema } from "mongoose";
import { string } from "zod";

mongoose.connect(process.env.MONGO_URL!);

const userSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required:true},
});

const urlSchema = new Schema({
    url:{type: String, required: true},
    shortUrl: {type: String, required: true, unique: true, index: true},
    clicks: {type:Number, required: true, default:0},
    user:{type: mongoose.Types.ObjectId, ref:"user", required: true}
})

export const userModel = mongoose.model("user",userSchema);
export const urlModel = mongoose.model("url",urlSchema);