import { client } from "../models/db";
import bcrypt from "bcrypt";
import { ReqMid } from "../types/user";
import { QueryResult } from "pg";
const { generateUserToken } = require("../middlewares/user.middleware");

const signup = async (req: any, res: any) => {
  console.log("SIGNUP request received", req.body);
  try {
    const { username, email, password } = req.body;
    const getQuery: string = `SELECT * FROM users WHERE email = $1`;
    const param: any[] = [email];
    const user: QueryResult<any> = await client.query(getQuery, param);
    if (user.rows.length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }
    const insertQuery: string = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`;
    const hashPassword = await bcrypt.hash(password, 10);
    const params: any[] = [username, email, hashPassword];
    const result: QueryResult<any> = await client.query(insertQuery, params);

    const getUserQuery: string = `SELECT * FROM users WHERE email = $1`;
    const userData: QueryResult<any> = await client.query(getUserQuery, [
      email,
    ]);
    const token = await generateUserToken(userData.rows[0].id);

    return res
      .status(201)
      .json({
        status: true,
        user: userData.rows[0],
        token: token,
        message: "User created successfully",
      });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const getQuery: string = `SELECT * FROM users WHERE email = $1`;
    const user: QueryResult<any> = await client.query(getQuery, [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ status: false, message: "User not found" });
    }
    console.log(user.rows[0]);
    const auth = await bcrypt.compare(password, user.rows[0].password);
    if (auth) {
      const token = await generateUserToken(user.rows[0].id);
      return res
        .status(200)
        .json({
          status: true,
          user: user.rows[0],
          token: token,
          message: "User logged in successfully",
        });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Password is incorrect" });
    }
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

const logout = async (req: ReqMid, res: any) => {
  if (!req.token) {
    return res.status(401).json({ error: "You are already logged out" });
  }
  const removeUser: string = "DELETE FROM user_token WHERE token = $1";
  const value: any[] = [req.token];
  try {
    const result: QueryResult<any> = await client.query(removeUser, value);

    return res.status(200).json({ success: "User logged out successfully!" });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "An error occurred while logging out" });
  }
};

module.exports = { signup, login, logout };
