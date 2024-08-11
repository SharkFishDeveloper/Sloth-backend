"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const client = new S3Client({
    region: 'us-east1', // Replace with your region
    credentials: {
        accessKeyId: process.env.AWS_SECRET,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/preassingedUrl", (req, res) => {
    console.log(process.env.AWS_SECRET);
});
app.listen(3000, () => console.log("Server started"));
