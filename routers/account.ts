/**Account 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { MemberDto } from "../dto/dtos";

dotenv.config();

/**----------------------------variables---------------------------*/
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
const key: string = process.env.SECRET_KEY || "";

/**-----------------------------routers----------------------------*/
router.post("/join", upload.single("MEM_IMG"), (req: Request, res: Response) => {
  const { MEM_EMAIL, MEM_NICK, MEM_PW }: Pick<MemberDto, "MEM_EMAIL" | "MEM_NICK" | "MEM_PW"> = req.body;
  const imgPath: string = req.files ? `uploads/member_img/${req.file?.filename}` : "";

  const nowDate: string = new Date().toISOString().slice(0, 10);

  db.query(`SELECT EXISTS (SELECT * FROM tb_member WHERE MEM_EMAIL= ? ) as userCheck`, [MEM_EMAIL], (error, result: any) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 500,
        message: error,
      });
    }

    if (result[0].userCheck === 1) {
      req.files && fs.unlinkSync(`uploads/member_img/${req.file?.filename}`);
      res.status(400).send({
        status: 400,
        message: "이미 등록된 이메일입니다.",
      });
    } else {
      const hashPassword = bcrypt.hashSync(MEM_PW, 10);

      db.query(
        `INSERT INTO tb_member (MEM_EMAIL, MEM_NICK, MEM_PW, MEM_IMG, MEM_REG_DT) VALUES (?, ?, ?, ?, ?)`,
        [MEM_EMAIL, MEM_NICK, hashPassword, imgPath, nowDate],
        (error, result) => {
          if (error) {
            console.log(error);
          }
          res.status(200).send({
            status: 200,
            message: "회원가입 성공",
          });
        }
      );
    }
  });
});

router.patch("/login", (req: Request, res: Response) => {
  const { MEM_EMAIL, MEM_PW }: Pick<MemberDto, "MEM_EMAIL" | "MEM_PW"> = req.body;

  db.query(`SELECT * FROM tb_member WHERE MEM_EMAIL = ?`, [MEM_EMAIL], (error, result: any) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 500,
        message: error,
      });
    }

    if (result.length > 0 && result[0].MEM_STATE === "E") {
      res.status(202).send({
        status: 202,
        message: "탈퇴회원입니다.",
      });
    } else {
      if (result.length > 0 && bcrypt.compareSync(MEM_PW, result[0].MEM_PW)) {
        const accessToken = jwt.sign({ MEM_ID: result[0].MEM_ID }, key, {
          expiresIn: "15m",
        });
        const refreshToken = jwt.sign({}, key, {
          expiresIn: "2h",
        });

        db.query(`UPDATE tb_member SET MEM_REFRESH_TOKEN = ?`, [refreshToken], (error) => {
          if (error) {
            console.log(error);
            res.status(500).send({
              status: 500,
              message: error,
            });
          }
        });
        res.cookie("accessToken", accessToken, { sameSite: "none", secure: true, domain: "https://we-note-front.vercel.app/" });
        res.cookie("refreshToken", refreshToken, { sameSite: "none", secure: true, domain: "https://we-note-front.vercel.app/" });
        res.status(200).send({
          status: 200,
          message: "로그인 성공",
          data: {
            accessToken,
            refreshToken,
            MEM_IMG: result[0].MEM_IMG,
          },
        });
      } else {
        res.status(402).send({
          status: 402,
          message: "아이디 및 비밀번호가 일치하지 않습니다.",
        });
      }
    }
  });
});

router.patch("/logout", (req: Request, res: Response) => {
  if (req.cookies) {
    const refreshToken = req.cookies.refreshToken;
    db.query(`UPDATE tb_member SET MEM_REFRESH_TOKEN = ? WHERE MEM_REFRESH_TOKEN = ?`, ["", refreshToken], (error) => {
      if (error) {
        console.log(error);
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        res.cookie("accessToken", "", { sameSite: "none", secure: true, domain: "https://we-note-front.vercel.app/" });
        res.cookie("refreshToken", "", { sameSite: "none", secure: true, domain: "https://we-note-front.vercel.app/" });
        res.status(200).send({
          status: 200,
          message: "OK",
        });
      }
    });
  } else {
    res.status(401).send({
      status: 401,
      message: "토큰 인증 오류",
    });
  }
});

export default router;
