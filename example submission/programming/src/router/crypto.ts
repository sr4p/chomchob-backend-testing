import { role, roles } from "../controller/middleware";
import express, { Router, Response } from "express";
import { addCrypto, exchangeRate, getBalance } from "../controller/crypto";

const router: Router = express.Router();

//@TODO: admin
router.post("/", roles([role.admin]),addCrypto);
router.get("/balance", roles([role.admin]),getBalance);
router.put("/exchange-rate/:id", roles([role.admin]),exchangeRate);

export { router as crypto };


// ผู้ดูแลระบบสามารถเพิ่มและลดยอดคงเหลือสกุลเงินดิจิทัลของผู้ใช้ได้ ✅
// ผู้ดูแลระบบสามารถดูยอดคงเหลือทั้งหมดของสกุลเงินดิจิทัลทั้งหมด ✅
// ผู้ดูแลระบบสามารถเพิ่มสกุลเงินดิจิทัลอื่นๆ เช่น XRP, EOS, XLM ลงในกระเป๋าเงินได้ ✅
// ผู้ดูแลระบบสามารถจัดการอัตราแลกเปลี่ยนระหว่างสกุลเงินดิจิทัลได้ ✅
// ผู้ใช้สามารถโอนสกุลเงินดิจิทัลเดียวกันไปยังผู้อื่นได้ ✅