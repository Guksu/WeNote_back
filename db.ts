import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createConnection({
  user: "root",
  host: "svc.sel3.cloudtype.app",
  password: "fire0704!!",
  database: "wenote",
  port: 32317,
});
