import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { urlModel, userModel } from "../db";
import { nanoid } from "nanoid";
import { userMiddleWare } from "../middleware";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    username: z.string().min(4).max(15),
    password: z.string().min(8).max(20),
  });
  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      msg: "Incorrect Format",
      error: parsedData.error,
    });
    return;
  }
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    await userModel.create({
      username: username,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({
    msg: "Singed Up!!!",
  });
});

userRouter.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await userModel.findOne({
      username,
    });
    if (!response) {
      res.status(403).json({
        msg: "User does not exist",
      });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, response.password);
    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: response._id,
        },
        process.env.JWT_SECRET!
      );
      res.json({
        msg: "Signed In!",
        token: token,
      });
    } else {
      res.status(403).json({
        msg: "Incorrect Credentials",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

userRouter.post("/create", userMiddleWare, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ msg: "URL is required" });
    return;
  }
  const shortUrl = nanoid(7);
  try {
    const newUrl = await urlModel.create({
      url: url,
      shortUrl: shortUrl,
      user: req.userID,
    });
    res.status(201).json({
      msg: "Short URL created",
      data: {
        originalURL: newUrl.url,
        shortUrl: newUrl.shortUrl,
        id: newUrl._id,
      },
    });
    return;
  } catch (error) {
    console.log(error);
  }
});

userRouter.get("/my-urls", userMiddleWare, async (req, res) => {
  const urls = await urlModel.find({
    user: req.userID,
  });
  res.json({ urls });
});

userRouter.delete("/delete", userMiddleWare , async (req , res) => {
  const {shortUrl} = req.body;
  if(!shortUrl){
    res.status(404).json({
      msg:"URL does not exists"
    })
    return
  }
  const deleted = await urlModel.deleteOne({
    shortUrl:shortUrl,
    user:req.userID,
  })
  if (deleted.deletedCount === 0) {
    res.status(404).json({ msg: "URL not found or not authorized" });
    return
  }
  res.json({
    msg:"Deleted"
  })
})

userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const url = await urlModel.findOne({
      shortUrl: id,
    });
    if (url) {
      res.redirect(url.url);
    } else {
      res.status(404).json({
        msg: "Not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});
