/**Account 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MysqlError } from "mysql";
import multer from "multer";
import path from "path";
import fs from "fs";
import { JoinDto } from "../dto/account";

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/member_img");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

router.post("/join", upload.single("MEM_IMG"), (req: Request, res: Response) => {
  const { MEM_EMAIL, MEM_NICK, MEM_PW }: JoinDto = req.body;
  const imgPath: string = `uploads/member_img/${req.file?.filename}`;

  const nowDate: string = new Date().toISOString().slice(0, 10);

  db.query(
    `SELECT EXISTS (SELECT * FROM tb_member WHERE MEM_EMAIL= ? ) as userCheck`,
    [MEM_EMAIL],
    (error: MysqlError | null, result: any) => {
      if (error) {
        console.log(error);
      }

      if (result[0].userCheck === 1) {
        fs.unlinkSync(`uploads/member_img/${req.file?.filename}`);
        res.status(400).send("이미 등록된 이메일입니다.");
      } else {
        const hashPassword = bcrypt.hashSync(MEM_PW, 10);

        db.query(
          `INSERT INTO tb_member (MEM_EMAIL, MEM_NICK, MEM_PW, MEM_IMG, MEM_REG_DT) VALUES (?, ?, ?, ?, ?)`,
          [MEM_EMAIL, MEM_NICK, hashPassword, imgPath, nowDate],
          (error: MysqlError | null, result: any) => {
            if (error) {
              console.log(error);
            }
            res.status(200).send("OK");
          }
        );
      }
    }
  );
});

export default router;
