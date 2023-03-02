/**메인파일 */

declare global {
  namespace Express {
    interface Request {
      memId?: number;
    }
  }
}

import express, { Express } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import jwtMiddleware from "./middleware/jwt";
import accountRouter from "./routers/account";
import profileRouter from "./routers/profile";
import noteRouter from "./routers/note";
import projectRouter from "./routers/project";
import projectNoteRouter from "./routers/project_note";

dotenv.config();

const app: Express = express();
const PORT: number = 8080;

app.use(helmet());
// app.use(cors());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("dev"));
// app.use(morgan("combined"));   배포시 combined로 더 정확한 정보를 가져오기 위해 사용
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use("/uploads", express.static("uploads"));

// 라우터 및 미들웨어
app.use("/account", accountRouter);
// app.use(jwtMiddleware);
app.use("/profile", profileRouter);
app.use("/note", noteRouter);
app.use("/project", projectRouter);
app.use("/project_note", projectNoteRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
