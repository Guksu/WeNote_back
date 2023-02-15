/**메인파일 */
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

dotenv.config();

const app: Express = express();
const PORT: number = 4000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
// app.use(morgan("combined"));   배포시 combined로 더 정확한 정보를 가져오기 위해 사용
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.send("express 실행 확인");
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
