import express from "express";
import { subscribe, verifyEmail } from "../controllers/subscriberController.js";

const router = express.Router();

router.post("/", subscribe);
router.get("/verify/:token", verifyEmail);

export default router;
