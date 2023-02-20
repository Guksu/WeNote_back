/**JWT인증 미들웨어 */
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "../db";
dotenv.config();

const key: string = process.env.SECRET_KEY || "";

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies) {
    const { accessToken, refreshToken }: { accessToken: string; refreshToken: string } =
      req.cookies;

    jwt.verify(accessToken, key, (error, result: any) => {
      if (error) {
        // 엑세스 토큰 만료
        jwt.verify(refreshToken, key, (error, result) => {
          if (error) {
            // 리프레시 토큰 만료
            res.status(401).send({
              status: 401,
              message: "토큰 만료",
            });
          } else {
            db.query(
              `SELECT * FROM tb_member WHERE MEM_REFRESH_TOKEN = ?`,
              [refreshToken],
              (error, result: any) => {
                if (error) {
                  console.log(error);
                  res.status(500).send({
                    status: 500,
                    message: error,
                  });
                } else {
                  const newAccessToken = jwt.sign({ MEM_ID: result[0].MEM_ID }, key, {
                    expiresIn: "15m",
                  });

                  res.cookie("accessToken", newAccessToken, { sameSite: "none", secure: true });
                  req.memId = +result[0].MEM_ID;
                  next();
                }
              }
            );
          }
        });
      } else {
        req.memId = result.MEM_ID;
        next();
      }
    });
  } else {
    res.status(401).send({
      status: 401,
      message: "토큰 만료",
    });
  }
};

export default jwtMiddleware;
