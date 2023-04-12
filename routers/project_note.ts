/**Project Note 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ProjectNoteDto } from "../dto/dtos";

/**----------------------------variables---------------------------*/
const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + "uploads/project_img");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

router.post("/create/:id", upload.single("PRO_NOTE_IMG"), (req: Request, res: Response) => {
  const projectId = req.params.id;
  const { PRO_NOTE_TITLE, PRO_NOTE_CONTENT }: Pick<ProjectNoteDto, "PRO_NOTE_TITLE" | "PRO_NOTE_CONTENT"> = req.body;
  const imgPath: string = req.file ? `uploads/project_img/${req.file?.filename}` : "";

  const nowDate: string = new Date().toISOString().slice(0, 10);

  db.query(
    "INSERT INTO tb_project_note (MEM_ID ,PRO_ID, PRO_NOTE_TITLE, PRO_NOTE_CONTENT, PRO_NOTE_IMG, PRO_NOTE_REG_DT ) VALUES (?, ?, ?, ?, ?, ?)",
    [req.memId, projectId, PRO_NOTE_TITLE, PRO_NOTE_CONTENT, imgPath, nowDate],
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

router.get("/all_list/:id", (req: Request, res: Response) => {
  const projectId = req.params.id;

  db.query(
    "SELECT tb_project_note.MEM_ID, PRO_NOTE_ID, PRO_NOTE_TITLE, PRO_NOTE_STATE,PRO_NOTE_CONTENT, PRO_NOTE_REG_DT, MEM_NICK,MEM_IMG FROM tb_project_note INNER JOIN tb_member ON tb_member.MEM_ID = tb_project_note.MEM_ID  WHERE PRO_ID = ? AND NOT PRO_NOTE_STATE = ?",
    [projectId, "D"],
    async (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        let editData = result;
        function edit() {
          for (let i = 0; i < editData.length; i++) {
            if (editData[i].MEM_ID === req.memId) {
              editData[i].ISOWNER = "Y";
            } else {
              editData[i].ISOWNER = "N";
            }
          }
        }
        await edit();

        res.status(200).send({
          status: 200,
          message: "ok",
          data: editData,
        });
      }
    }
  );
});

router.get("/detail/:id", (req: Request, res: Response) => {
  const projectNoteId = req.params.id;

  db.query(
    "SELECT tb_member.MEM_ID, MEM_NICK, MEM_IMG, PRO_NOTE_TITLE, PRO_NOTE_CONTENT, PRO_NOTE_IMG FROM tb_project_note INNER JOIN tb_member ON tb_member.MEM_ID = tb_project_note.MEM_ID WHERE PRO_NOTE_ID = ?",
    [projectNoteId],
    (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else if (result.length > 0) {
        res.status(200).send({
          status: 200,
          message: "ok",
          data: [result[0], { ISOWNER: req.memId === result[0].MEM_ID ? "Y" : "N" }],
        });
      } else {
        res.status(404).send({
          status: 404,
          message: "노트가 존재하지 않습니다.",
        });
      }
    }
  );
});

router.patch("/update/:id", upload.single("PRO_NOTE_IMG"), (req: Request, res: Response) => {
  const projectId = req.params.id;

  db.query("SELECT * FROM tb_project_note WHERE PRO_NOTE_ID = ?", [projectId], (error, result) => {
    if (error) {
      res.status(500).send({
        status: 500,
        message: error,
      });
    } else if (result.length > 0) {
      const proNoteTitle: string = req.body.PRO_NOTE_TITLE ? req.body.PRO_NOTE_TITLE : result[0].PRO_NOTE_TITLE;
      const proNoteContent: string = req.body.PRO_NOTE_CONTENT ? req.body.PRO_NOTE_CONTENT : result[0].PRO_NOTE_CONTENT;
      const imgPath: string = req.file ? `uploads/project_img/${req.file?.filename}` : result[0].PRO_NOTE_IMG || "";
      const nowDate: string = new Date().toISOString().slice(0, 10);

      db.query(
        "UPDATE tb_project_note SET PRO_NOTE_TITLE = ?, PRO_NOTE_CONTENT = ?, PRO_NOTE_IMG = ?, PRO_NOTE_UPDATE_DT = ? WHERE PRO_NOTE_ID = ? ",
        [proNoteTitle, proNoteContent, imgPath, nowDate, projectId],
        (error, result2) => {
          if (error) {
            res.status(500).send({
              status: 500,
              message: error,
            });
          } else {
            req.file && result[0].PRO_NOTE_IMG !== "" && fs.unlinkSync(result[0].PRO_NOTE_IMG);
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
  const projectId = req.params.id;
  const proNoteState: string = req.body.PRO_NOTE_STATE;

  db.query("UPDATE tb_project_note SET PRO_NOTE_STATE = ? WHERE PRO_NOTE_ID = ?", [proNoteState, projectId], (error, result) => {
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

router.post("/comment_create/:id", (req: Request, res: Response) => {
  const projectNoteId = req.params.id;
  const commentContent: string = req.body.COMMENT_CONTENT;

  const nowDate: string = new Date().toISOString().slice(0, 10);

  db.query(
    "INSERT INTO tb_comment (MEM_ID, PRO_NOTE_ID, COMMENT_CONTENT,  COMMENT_REG_DT ) VALUES (?, ?, ?, ?)",
    [req.memId, projectNoteId, commentContent, nowDate],
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

router.patch("/comment_update", (req: Request, res: Response) => {
  const commentContent: string = req.body.COMMENT_CONTENT;
  const commentId: string = req.body.COMMENT_ID;

  db.query("UPDATE tb_comment SET COMMENT_CONTENT = ? WHERE COMMENT_ID = ?", [commentContent, commentId], (error, result) => {
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

router.patch("/comment_delete", (req: Request, res: Response) => {
  const commentId: string = req.body.COMMENT_ID;

  db.query("UPDATE tb_comment SET COMMENT_STATE = ? WHERE COMMENT_ID = ?", ["D", commentId], (error, result) => {
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

router.get("/comment_list/:id", (req: Request, res: Response) => {
  const projectNoteId = req.params.id;

  db.query(
    "SELECT tb_comment.MEM_ID, MEM_NICK, MEM_IMG, COMMENT_CONTENT, COMMENT_REG_DT FROM tb_comment INNER JOIN tb_member ON tb_member.MEM_ID = tb_comment.MEM_ID WHERE PRO_NOTE_ID = ? AND COMMENT_STATE = ?",
    [projectNoteId, "N"],
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

export default router;
