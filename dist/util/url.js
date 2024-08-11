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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreassignedUrl = getPreassignedUrl;
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
function getPreassignedUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new S3Client({
                region: "ap-south-1",
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const command = new GetObjectCommand({
                Bucket: "git-bucket0",
                Key: "repos",
            });
            //   console.log( process.env.AWS_SECRET," ", process.env.AWS_SECRET_KEY);
            const url = yield getSignedUrl(client, command, { expiresIn: 600 });
            return { url };
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
