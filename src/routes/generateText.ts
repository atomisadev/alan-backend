import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_TOKEN! });

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const imageUrl = req.body.imageUrl;
    console.log(imageUrl);
    const input = {
      image: imageUrl,
      prompt:
        "Give me the mood of this image, and describe it in immense detail."
    };

    const output: any = await replicate.run(
      "yorickvp/llava-13b:b5f6212d032508382d61ff00469ddda3e32fd8a0e75dc39d8a4191bb742157fb",
      { input }
    );
    res.status(200).json(output.join(""));
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

export default router;
