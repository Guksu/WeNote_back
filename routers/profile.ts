/**Profile 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";

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

/**-----------------------------routers----------------------------*/
router.get("/info", (req: Request, res: Response) => {
  if (req.headers.authorization) {
    db.query("SELECT * FROM tb_member WHERE MEM_ID = ?", [req.memId], (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        const MEM_NICK = result[0].MEM_NICK || "";
        const MEM_EMAIL = result[0].MEM_EMAIL || "";
        const MEM_IMG = result[0].MEM_IMG || "";
        res.status(200).send({
          status: 200,
          message: {
            MEM_NICK,
            MEM_EMAIL,
            MEM_IMG,
          },
        });
      }
    });
  } else {
    res.status(400).send({
      status: 400,
      message: "토큰 만료",
    });
  }
});

router.patch("/update", upload.single("MEM_IMG"), (req: Request, res: Response) => {
  if (req.headers.authorization) {
    db.query("SELECT * FROM tb_member WHERE MEM_ID = ?", [req.memId], (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        const MEM_NICK: string = req.body.MEM_NICK ? req.body.MEM_NICK : result[0].MEM_NICK;
        const imgPath: string = req.file
          ? `uploads/member_img/${req.file?.filename}`
          : result[0].MEM_IMG;
        const nowDate: string = new Date().toISOString().slice(0, 10);

        db.query(
          "UPDATE tb_member SET MEM_NICK = ? , MEM_IMG = ? , MEM_UPDATE_DT = ? WHERE MEM_ID = ?",
          [MEM_NICK, imgPath, nowDate, req.memId],
          (error, result) => {
            if (error) {
              res.status(500).send({
                status: 500,
                message: error,
              });
            } else {
              res.status(200).send({
                status: 200,
                message: "ok",
              });
            }
          }
        );
      }
    });
  } else {
    res.status(400).send({
      status: 400,
      message: "토큰 만료",
    });
  }
});

router.patch("/withdrawl_membership", (req: Request, res: Response) => {
  db.query(
    "UPDATE tb_member SET MEM_STATE = ? WHERE MEM_ID = ?",
    ["E", req.memId],
    (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "ok",
        });
      }
    }
  );
});

export default router;
