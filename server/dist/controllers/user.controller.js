"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../models/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const { generateUserToken } = require("../middlewares/user.middleware");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGNUP request received", req.body);
    try {
        const { username, email, password } = req.body;
        const getQuery = `SELECT * FROM users WHERE email = $1`;
        const param = [email];
        const user = yield db_1.client.query(getQuery, param);
        if (user.rows.length > 0) {
            return res
                .status(400)
                .json({ status: false, message: "User already exists" });
        }
        const insertQuery = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`;
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        const params = [username, email, hashPassword];
        const result = yield db_1.client.query(insertQuery, params);
        const getUserQuery = `SELECT * FROM users WHERE email = $1`;
        const userData = yield db_1.client.query(getUserQuery, [
            email,
        ]);
        const token = yield generateUserToken(userData.rows[0].id);
        return res
            .status(201)
            .json({
            status: true,
            user: userData.rows[0],
            token: token,
            message: "User created successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error" });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const getQuery = `SELECT * FROM users WHERE email = $1`;
        const user = yield db_1.client.query(getQuery, [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ status: false, message: "User not found" });
        }
        console.log(user.rows[0]);
        const auth = yield bcrypt_1.default.compare(password, user.rows[0].password);
        if (auth) {
            const token = yield generateUserToken(user.rows[0].id);
            return res
                .status(200)
                .json({
                status: true,
                user: user.rows[0],
                token: token,
                message: "User logged in successfully",
            });
        }
        else {
            return res
                .status(400)
                .json({ status: false, message: "Password is incorrect" });
        }
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ status: false, message: "Internal Server Error" });
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.token) {
        return res.status(401).json({ error: "You are already logged out" });
    }
    const removeUser = "DELETE FROM user_token WHERE token = $1";
    const value = [req.token];
    try {
        const result = yield db_1.client.query(removeUser, value);
        return res.status(200).json({ success: "User logged out successfully!" });
    }
    catch (err) {
        return res
            .status(500)
            .json({ error: "An error occurred while logging out" });
    }
});
module.exports = { signup, login, logout };
