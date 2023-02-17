/**JWT인증 미들웨어 */
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "../db";
dotenv.config();

const key: string = process.env.SECRET_KEY || "";

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const accessToken = req.headers.authorization.split(" ")[1];
    const refreshToken = req.headers.authorization.split(" ")[2];

    jwt.verify(accessToken, key, (error, result) => {
      if (error) {
        // 엑세스 토큰 만료
        jwt.verify(refreshToken, key, (error, result) => {
          if (error) {
            // 리프레시 토큰 만료
            res.status(400).send({
              status: 400,
              message: "토큰 만료",
            });
          } else {
            db.query(
              `SELECT * FROM tb_member WHERE MEM_REFRESH_TOKEN = ?`,
              [refreshToken],
              (error, result: any) => {
                if (error) {
                  console.log(error);
                  res.status(500).send(error);
                } else {
                  const newAccessToken = jwt.sign({ MEM_ID: result[0].MEM_ID }, key, {
                    expiresIn: "15m",
                  });

                  req.headers.authorization = `Bearer ${newAccessToken} ${refreshToken}`;
                  next();
                }
              }
            );
          }
        });
      } else {
        next();
      }
    });
  }
};

export default jwtMiddleware;
