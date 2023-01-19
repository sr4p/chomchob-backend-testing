import express, { Router } from "express";
import { signIn , signUp, userInfo } from "../controller/auth";

const router: Router = express.Router();

router.post("/register",signUp);
router.post("/login",signIn);
router.post("/info",userInfo);

export { router as auth };
