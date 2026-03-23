import { Router } from "express";
import { vnpayReturn, vnpayIpn } from "../controllers/payment.controller.js";

export const vnpayRouter = Router();

// These are public routes (VNPay callbacks, no auth required)
vnpayRouter.get("/return", vnpayReturn);
vnpayRouter.get("/ipn", vnpayIpn);
