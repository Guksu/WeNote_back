import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createConnection({
  user: "wenote-user",
  host: "srv-captain--zpjnuiysrk-mysql-80x",
  password: process.env.DB_PASSWORD,
  database: "wenote-database",
  port: 3306,
});
