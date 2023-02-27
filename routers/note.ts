/**개인 Note 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { NoteDto } from "../dto/dtos";

/**----------------------------variables---------------------------*/
const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/note_img");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

router.post("/create", upload.single("NOTE_IMG"), (req: Request, res: Response) => {
  const { NOTE_TITLE, NOTE_CONTENT }: Pick<NoteDto, "NOTE_TITLE" | "NOTE_CONTENT"> = req.body;
  const imgPath: string = req.file ? `uploads/note_img/${req.file?.filename}` : "";

  const nowDate: string = new Date().toISOString().slice(0, 10);

  db.query(
    "INSERT INTO tb_note (MEM_ID , NOTE_TITLE, NOTE_CONTENT, NOTE_IMG, NOTE_REG_DT ) VALUES (?, ?, ?, ?, ?)",
    [req.memId, NOTE_TITLE, NOTE_CONTENT, imgPath, nowDate],
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

router.get("/all_list", (req: Request, res: Response) => {
  db.query(
    "SELECT NOTE_ID, NOTE_TITLE, NOTE_STATE,NOTE_REG_DT,NOTE_CONTENT FROM tb_note WHERE MEM_ID = ? AND NOT NOTE_STATE = ?",
    [req.memId, "D"],
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
          data: result,
        });
      }
    }
  );
});

router.get("/detail/:id", (req: Request, res: Response) => {
  const noteId = req.params.id;

  db.query("SELECT NOTE_TITLE, NOTE_CONTENT,NOTE_REG_DT,NOTE_STATE,NOTE_IMG  FROM tb_note WHERE NOTE_ID = ?", [noteId], (error, result) => {
    if (error) {
      res.status(500).send({
        status: 500,
        message: error,
      });
    } else if (result.length > 0) {
      res.status(200).send({
        status: 200,
        message: "ok",
        data: result[0],
      });
    } else {
      res.status(404).send({
        status: 404,
        message: "노트가 존재하지 않습니다.",
      });
    }
  });
});

router.patch("/update/:id", upload.single("NOTE_IMG"), (req: Request, res: Response) => {
  const noteId = req.params.id;

  db.query("SELECT * FROM tb_note WHERE NOTE_ID = ?", [noteId], (error, result) => {
    if (error) {
      res.status(500).send({
        status: 500,
        message: error,
      });
    } else if (result.length > 0) {
      const noteTitle: string = req.body.NOTE_TITLE ? req.body.NOTE_TITLE : result[0].NOTE_TITLE;
      const noteContent: string = req.body.NOTE_CONTENT ? req.body.NOTE_CONTENT : result[0].NOTE_CONTENT;
      const imgPath: string = req.file ? `uploads/note_img/${req.file?.filename}` : result[0].NOTE_IMG || "";
      const nowDate: string = new Date().toISOString().slice(0, 10);

      db.query(
        "UPDATE tb_note SET NOTE_TITLE = ?, NOTE_CONTENT = ?, NOTE_IMG = ?, NOTE_UPDATE_DT = ? WHERE NOTE_ID = ? ",
        [noteTitle, noteContent, imgPath, nowDate, noteId],
        (error, result2) => {
          if (error) {
            res.status(500).send({
              status: 500,
              message: error,
            });
          } else {
            req.file && result[0].NOTE_IMG !== "" && fs.unlinkSync(result[0].NOTE_IMG);
            res.status(200).send({
              status: 200,
              message: "ok",
            });
          }
        }
      );
    } else {
      res.status(404).send({
        status: 404,
        message: "노트가 존재하지 않습니다.",
      });
    }
  });
});

router.patch("/state_change/:id", (req: Request, res: Response) => {
  const noteId = req.params.id;
  const noteState: string = req.body.NOTE_STATE;

  db.query("UPDATE tb_note SET NOTE_STATE = ? WHERE NOTE_ID = ?", [noteState, noteId], (error, result) => {
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
  });
});

export default router;
