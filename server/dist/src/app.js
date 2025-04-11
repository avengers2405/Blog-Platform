"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const axios_1 = __importDefault(require("axios"));
const express_1 = __importStar(require("express"));
const cors = require("cors");
const cron = require("node-cron");
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use((0, express_1.urlencoded)({ extended: true }));
app.use(express_1.default.json());
const userRoutes = require("../routes/user.routes");
const blogRoutes = require("../routes/blog.routes");
app.use(userRoutes);
app.use(blogRoutes);
const port = process.env.PORT || 5000;
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Server running!");
}));
app.listen(port, () => {
    console.log(`Server running at ${port}`);
});
// Added cron
app.get("/ping", (req, res) => {
    res.status(200).json("pong....");
});
const API_ENDPOINT = "http://localhost:5000/";
const makeApiRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(API_ENDPOINT);
        return response.data;
    }
    catch (err) {
        console.error("API request failed:", err.message);
        throw err;
    }
});
const runApiRequestJob = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running API request job...");
    try {
        const responseData = yield makeApiRequest();
        return responseData;
    }
    catch (error) {
        return null;
    }
});
cron.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const responseData = yield runApiRequestJob();
    if (responseData) {
        // Process the response data here
        console.log("API request successful:", responseData);
    }
    else {
        console.log("API request failed");
    }
}));
