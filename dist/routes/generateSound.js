"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instrument = req.body.instrument;
        const prompt = "Use only a " + instrument + ". " + req.body.prompt;
        const duration = 15;
        const input = {
            version: "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
            input: {
                prompt,
                model_version: "stereo-melody-large",
                output_format: "mp3",
                normalization_strategy: "peak",
                duration,
            },
        };
        const replicateResponse = yield axios_1.default.post("https://api.replicate.com/v1/predictions", input, {
            headers: {
                Authorization: `Bearer ${process.env.REPLICATE_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        const getUrl = replicateResponse.data.urls.get;
        const getOutput = () => __awaiter(void 0, void 0, void 0, function* () {
            const pollResponse = yield axios_1.default.get(getUrl, {
                headers: { Authorization: `Bearer ${process.env.REPLICATE_TOKEN}` },
            });
            if (pollResponse.status !== 200) {
                throw new Error(`Request failed: ${pollResponse.status}`);
            }
            const pollData = pollResponse.data;
            if (pollData.status === "succeeded") {
                return pollData.output;
            }
            else if (pollData.status === "failed" ||
                pollData.status === "canceled") {
                throw new Error(`Prediction failed or canceled: ${pollData.status}`);
            }
            else {
                return null;
            }
        });
        let output = null;
        while (!output) {
            try {
                output = yield getOutput();
            }
            catch (error) {
                console.error(error);
            }
            yield new Promise((resolve) => setTimeout(resolve, 5000));
        }
        res.send(output);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}));
exports.default = router;
