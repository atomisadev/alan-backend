import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const instrument = req.body.instrument;
    const prompt = "Use only a " + instrument + ". " + req.body.prompt;
    const duration = 15;

    const input = {
      version:
        "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      input: {
        prompt,
        model_version: "stereo-melody-large",
        output_format: "mp3",
        normalization_strategy: "peak",
        duration,
      },
    };
    const replicateResponse = await axios.post(
      "https://api.replicate.com/v1/predictions",
      input,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const getUrl = replicateResponse.data.urls.get;

    const getOutput = async () => {
      const pollResponse = await axios.get(getUrl, {
        headers: { Authorization: `Bearer ${process.env.REPLICATE_TOKEN}` },
      });

      if (pollResponse.status !== 200) {
        throw new Error(`Request failed: ${pollResponse.status}`);
      }

      const pollData = pollResponse.data;
      if (pollData.status === "succeeded") {
        return pollData.output;
      } else if (
        pollData.status === "failed" ||
        pollData.status === "canceled"
      ) {
        throw new Error(`Prediction failed or canceled: ${pollData.status}`);
      } else {
        return null;
      }
    };

    let output = null;
    while (!output) {
      try {
        output = await getOutput();
      } catch (error) {
        console.error(error);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    res.send(output);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

export default router;

