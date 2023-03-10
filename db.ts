import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createConnection({
  user: "root",
  host: "svc.sel3.cloudtype.app",
  password: process.env.DB_PASSWORD,
  database: "wenote",
  port: 32317,
});
