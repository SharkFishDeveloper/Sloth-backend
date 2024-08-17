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
exports.getPreassignedUrlForContributors = getPreassignedUrlForContributors;
exports.getPrDownloadUrl = getPrDownloadUrl;
exports.getPullRequestPreAssingedUrl = getPullRequestPreAssingedUrl;
exports.getPrDownloadUrlFork = getPrDownloadUrlFork;
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
function getPreassignedUrl(id, reponame) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3Client = new S3Client({
                region: 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
                Bucket: 'git-bucket0',
                Key: `repos/${id}/${reponame}/${reponame}.gz`,
                Conditions: [
                    ['content-length-range', 0, 5 * 1024 * 1024 * 10] // 50 MB max
                ],
                Expires: 60
            });
            return { url, fields };
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
function getPreassignedUrlForContributors(id, reponame, randomPrId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3Client = new S3Client({
                region: 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
                Bucket: 'git-bucket0',
                //repos // 11111111 // hunter // hunter.gz
                Key: `repos/${id}/${reponame}/pr/${randomPrId}.gz`,
                Conditions: [
                    ['content-length-range', 0, 5 * 1024 * 1024 * 10] // 50 MB max
                ],
                Expires: 60
            });
            return { url, fields };
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
function getPrDownloadUrl(mainId, prId, reponame) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3Client = new S3Client({
                region: 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const command = new GetObjectCommand({
                Bucket: 'git-bucket0',
                Key: `repos/${mainId}/${reponame}/pr/${prId}.gz`
            });
            const url = yield getSignedUrl(s3Client, command, { expiresIn: 30 });
            return url;
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
function getPullRequestPreAssingedUrl(reponame, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3Client = new S3Client({
                region: 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const command = new GetObjectCommand({
                Bucket: 'git-bucket0',
                Key: `repos/${userId}/${reponame}/${reponame}.gz`
            });
            const url = yield getSignedUrl(s3Client, command, { expiresIn: 30 });
            return url;
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
function getPrDownloadUrlFork(userId, name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3Client = new S3Client({
                region: 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_SECRET,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            const command = new GetObjectCommand({
                Bucket: 'git-bucket0',
                Key: `repos/${userId}/${name}/${name}.gz`
            });
            const url = yield getSignedUrl(s3Client, command, { expiresIn: 30 });
            return url;
        }
        catch (error) {
            console.log(error);
            return { error };
        }
    });
}
