/**PROJECT 관련 API*/
import express, { Request, Response } from "express";
import { db } from "../db";
import { ProjectDto } from "../dto/dtos";
import multer from "multer";
import path from "path";
import fs from "fs";

/**----------------------------variables---------------------------*/
const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/project_img");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

router.post("/create", upload.single("PRO_IMG"), (req: Request, res: Response) => {
  const { PRO_CATEGORY, PRO_TITLE, PRO_CONTENT }: Pick<ProjectDto, "PRO_CATEGORY" | "PRO_CONTENT" | "PRO_TITLE"> = req.body;
  const nowDate: string = new Date().toISOString().slice(0, 10);
  const imgPath: string = req.file ? `uploads/project_img/${req.file?.filename}` : "";

  db.query(
    "INSERT INTO tb_project (PRO_CATEGORY, PRO_TITLE, PRO_CONTENT, PRO_REG_DT, PRO_IMG) VALUES (?, ?, ?, ?,?)",
    [PRO_CATEGORY, PRO_TITLE, PRO_CONTENT, nowDate, imgPath],
    (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else {
        db.query(
          "INSERT INTO tb_project_member (MEM_ID, PRO_ID, PRO_MEM_ROLE) VALUES (?, ?, ?)",
          [req.memId, result.insertId, "R"],
          (error, result2) => {
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
    }
  );
});

router.patch("/update/:id", upload.single("PRO_IMG"), (req: Request, res: Response) => {
  const projectId = req.params.id;

  db.query("SELECT * FROM tb_project WHERE PRO_ID = ?", [projectId], (error, result) => {
    if (error) {
      res.status(500).send({
        status: 500,
        message: error,
      });
    } else if (result.length > 0) {
      const proCategory: string = req.body.PRO_CATEGORY ? req.body.PRO_CATEGORY : result[0].PRO_CATEGORY;
      const proTitle: string = req.body.PRO_TITLE ? req.body.PRO_TITLE : result[0].PRO_TITLE;
      const proContent: string = req.body.PRO_CONTENT ? req.body.PRO_CONTENT : result[0].PRO_CONTENT;
      const proState: string = req.body.PRO_STATE ? req.body.PRO_STATE : result[0].PRO_STATE;
      const nowDate: string = new Date().toISOString().slice(0, 10);
      const imgPath: string = req.file ? `uploads/project_img/${req.file?.filename}` : result[0].PRO_IMG || "";

      db.query(
        "UPDATE tb_project SET PRO_CATEGORY = ?, PRO_TITLE = ?, PRO_CONTENT = ?, PRO_STATE =?, PRO_UPDATE_DT =?, PRO_IMG = ? WHERE PRO_ID = ?",
        [proCategory, proTitle, proContent, proState, nowDate, imgPath, projectId],
        (error, result2) => {
          if (error) {
            res.status(500).send({
              status: 500,
              message: error,
            });
          } else {
            req.file && result[0].PRO_IMG !== "" && fs.unlinkSync(result[0].PRO_IMG);
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
        message: "프로젝트가 존재하지 않습니다.",
      });
    }
  });
});

router.get("/detail/:id", (req: Request, res: Response) => {
  const projectId = req.params.id;

  db.query(
    "SELECT PRO_CATEGORY, PRO_TITLE, PRO_CONTENT, PRO_REG_DT,PRO_STATE, PRO_IMG FROM tb_project WHERE PRO_ID = ? ",
    [projectId, "R"],
    (error, result) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: error,
        });
      } else if (result.length > 0) {
        db.query("SELECT * FROM tb_project_member WHERE MEM_ID = ? AND PRO_ID = ? ", [req.memId, projectId], (error, result2) => {
          if (error) {
            res.status(500).send({
              status: 500,
              message: error,
            });
          } else {
            const memberCheck = result2.length > 0 ? "Y" : "N";

            res.status(200).send({
              status: 200,
              message: "ok",
              data: { ...result[0], MEMBER_CHECK: memberCheck },
            });
          }
        });
      } else {
        res.status(404).send({
          status: 404,
          message: "프로젝트가 존재하지 않습니다.",
        });
      }
    }
  );
});

router.get("/all_list", (req: Request, res: Response) => {
  const proCategory = req.query.PRO_CATEGORY === "0" ? `1,2,3,4` : req.query.PRO_CATEGORY;
  const keyword = req.query.KEYWORD ? req.query.KEYWORD : "";
  const pageStart: number = (Number(req.query.PAGE) - 1) * 10;
  const pageEnd: number = Number(req.query.PAGE) * 10;

  db.query(
    `SELECT PRO_ID, PRO_CATEGORY, PRO_CONTENT, PRO_TITLE, PRO_REG_DT , PRO_IMG FROM tb_project WHERE PRO_STATE = ? AND PRO_CATEGORY IN (${proCategory}) AND PRO_TITLE LIKE "%${keyword}%" LIMIT ?,?`,
    ["W", pageStart, pageEnd],
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

router.post("/participation", (req: Request, res: Response) => {
  const proId: string = req.body.PRO_ID;

  db.query("INSERT INTO tb_project_member (MEM_ID, PRO_ID, PRO_MEM_ROLE) VALUES (?, ?, ?)", [req.memId, +proId, "W"], (error, result) => {
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

router.patch("/role_change", (req: Request, res: Response) => {
  const memId: number = req.body.MEM_ID;
  const proId: number = req.body.PRO_ID;
  const acceptedYn: string = req.body.ACCEPTED_YN;

  if (acceptedYn === "Y") {
    db.query("UPDATE tb_project_member SET PRO_MEM_ROLE= ? WHERE MEM_ID = ? AND PRO_ID = ?", ["M", memId, proId], (error, result) => {
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
  } else {
    db.query("UPDATE tb_project_member SET PRO_MEM_ROLE= ? WHERE MEM_ID = ? AND PRO_ID = ?", ["D", memId, proId], (error, result) => {
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
  }
});

router.get("/participation_list", (req: Request, res: Response) => {
  db.query(
    "SELECT PRO_TITLE , PRO_MEM_ROLE, PRO_CATEGORY FROM tb_project_member INNER JOIN tb_project ON tb_project.PRO_ID = tb_project_member.PRO_ID WHERE MEM_ID = ? AND PRO_MEM_ROLE NOT IN (?)",
    [req.memId, "R"],
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

router.get("/accepted_list/:id", (req: Request, res: Response) => {
  const proId = req.params.id;

  db.query(
    "SELECT MEM_ID, MEM_NICK, MEM_IMG FROM tb_member WHERE MEM_ID IN (SELECT MEM_ID FROM tb_project_member WHERE PRO_ID = ? AND PRO_MEM_ROLE = ?)",
    [proId, "W"],
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

router.get("/project_member_list/:id", (req: Request, res: Response) => {
  const proId = req.params.id;

  db.query(
    "SELECT tb_member.MEM_ID ,MEM_NICK, MEM_IMG , PRO_MEM_ROLE FROM tb_project_member INNER JOIN tb_member ON tb_member.MEM_ID = tb_project_member.MEM_ID WHERE PRO_ID = ? AND (PRO_MEM_ROLE = (?) OR PRO_MEM_ROLE = (?))",
    [proId, "R", "M"],
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

router.get("/all_project_list", (req: Request, res: Response) => {
  db.query(
    "SELECT PRO_ID, PRO_TITLE,PRO_CONTENT, PRO_REG_DT, PRO_CATEGORY,PRO_IMG,PRO_STATE FROM tb_project WHERE PRO_ID IN (SELECT PRO_ID FROM tb_project_member WHERE MEM_ID = ? AND PRO_MEM_ROLE = ?)",
    [req.memId, "M"],
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

router.get("/my_project_list", (req: Request, res: Response) => {
  db.query(
    "SELECT PRO_ID, PRO_TITLE,PRO_CONTENT, PRO_REG_DT, PRO_CATEGORY,PRO_IMG,PRO_STATE FROM tb_project WHERE PRO_ID IN (SELECT PRO_ID FROM tb_project_member WHERE MEM_ID = ? AND PRO_MEM_ROLE = ?)",
    [req.memId, "R"],
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
