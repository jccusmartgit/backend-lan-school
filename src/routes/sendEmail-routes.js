import express from "express";
import { methods as sendRecoveryCode } from '../controllers/sendEmail-controllers.js';
const router = express.Router();

router.post("/send-recovery-code", sendRecoveryCode.sendRecoveryEmailCode);
router.post("/check-email", sendRecoveryCode.checkEmailExists);
router.patch("/resetkey/:email", sendRecoveryCode.resetKey);

export default router;