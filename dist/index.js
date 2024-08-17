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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const url_1 = require("./util/url");
const db_1 = __importDefault(require("./util/db"));
const zod_1 = require("zod");
const requestBodySchema = zod_1.z.object({
    reponame: zod_1.z.string()
        .min(6, { message: "Repo name too short" }),
    email: zod_1.z.string()
        .email({ message: "Invalid email address" }),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters long" })
});
const requestBodySchemaInit = zod_1.z.object({
    reponame: zod_1.z.string()
        .min(6, { message: "Repo name too short" }),
    email: zod_1.z.string()
        .email({ message: "Invalid email address" }),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    description: zod_1.z.string().max(30, "Too long description").optional()
});
const pullrRequestBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    repoName: zod_1.z.string().min(6),
    totalCommits: zod_1.z.number(),
    childBranch: zod_1.z.string(),
    parentBranch: zod_1.z.string(),
    message: zod_1.z.string().min(8).max(50)
});
const mergeRequestBodySchema = zod_1.z.object({
    // reponame: z.string()
    //   .min(6, { message: "Repo name too short" }),
    email: zod_1.z.string()
        .email({ message: "Invalid email address" }),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    prid: zod_1.z.string()
});
require('dotenv').config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/init", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = requestBodySchemaInit.parse(req.body);
        const { email, password, reponame, description } = req.body;
        const user = yield db_1.default.user.findUnique({
            where: {
                email: email,
                password: password, // TODO : hash it, 
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!user) {
            return res.json({ message: "No user found !!. Please fill correctly" }).status(403);
        }
        yield db_1.default.repositories.create({
            data: {
                name: reponame,
                userId: user.id,
                description,
                creatorName: user.name
            }
        });
        const url = yield (0, url_1.getPreassignedUrl)(user.id, reponame);
        return res.json({ message: url, id: user.id }).status(200);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Enter properly all fields", status: 400 });
        }
        //@ts-ignore
        if (error.code === "P2002") {
            return res.json({ message: "Please enter a unique repo name", status: 400 }).status(500);
        }
        return res.json({ message: error, status: 400 }).status(500);
    }
}));
app.post("/push", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = requestBodySchema.parse(req.body);
        const { email, password, reponame } = req.body;
        const user = yield db_1.default.user.findUnique({
            where: {
                email: email,
                password: password, // TODO : hash it, 
            },
            select: {
                id: true
            }
        });
        if (!user) {
            return res.json({ message: "No user found !!. Please fill correctly" }).status(403);
        }
        const reponameCheck = yield db_1.default.repositories.findUnique({
            where: {
                name: reponame,
                userId: user.id,
            },
        });
        if (reponameCheck) {
            const url = yield (0, url_1.getPreassignedUrl)(user.id, reponame);
            return res.json({ message: url, id: user.id }).status(200);
        }
        else {
            return res.json({ message: "No such repository exists, please create a pull request or create origin" }).status(400);
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Enter properly all fields" });
        }
        //@ts-ignore
        if (error.code === "P2002") {
            return res.json({ message: "Please enter a unique repo name" }).status(500);
        }
        return res.json({ message: error }).status(500);
    }
}));
app.post("/push-origin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = pullrRequestBodySchema.parse(req.body);
        const { email, password, repoName, totalCommits, childBranch, parentBranch, message } = req.body;
        const user = yield db_1.default.user.findUnique({
            where: {
                email: email,
                password: password, // TODO : hash it, 
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!user) {
            return res.json({ message: "No user found !!. Please fill correctly" }).status(403);
        }
        const reponameCheck = yield db_1.default.repositories.findUnique({
            where: {
                name: repoName,
            },
            select: {
                userId: true,
                collaborationOption: true,
                contributors: true
            }
        });
        if (reponameCheck) {
            if (reponameCheck.userId === user.id) {
                return res.json({ message: "Please use < push origin > command", status: 400 });
            }
            else {
                if (reponameCheck.collaborationOption) {
                    const collaborators = reponameCheck.contributors;
                    const collaboratorExists = collaborators.find(collaborator => collaborator === user.name);
                    if (!collaboratorExists) {
                        return res.json({ message: `You cannot contribute to - ${repoName}`, status: 400 });
                    }
                }
                const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
                const randomPrId = randomSixDigitNumber.toString();
                yield db_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                    yield prisma.pullRequest.create({
                        data: {
                            id: randomPrId,
                            parentBranch,
                            childBranch,
                            totalCommits,
                            message,
                            contributor: user.name,
                            repositoryName: repoName,
                            creatorId: reponameCheck.userId
                        },
                    });
                    yield prisma.userPullRequest.create({
                        data: {
                            id: randomPrId,
                            repoName: repoName,
                            userName: user.name
                        }
                    });
                }));
                const url = yield (0, url_1.getPreassignedUrlForContributors)(reponameCheck.userId, repoName, randomPrId);
                return res.json({ message: url, id: user.id }).status(200);
            }
        }
        else {
            return res.json({ message: "No such repository exists, please create a pull request or create origin", status: 400 }).status(400);
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: `--- Enter properly all fields ---
        ${error.errors[0].message}`, status: 400 });
        }
        //@ts-ignore
        if (error.code === "P2002") {
            return res.json({ message: "Please enter a unique repo name", status: 400 }).status(500);
        }
        return res.json({ message: error }).status(500);
    }
}));
app.post("/merge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = mergeRequestBodySchema.parse(req.body);
        const { email, password, prid } = req.body;
        const user = yield db_1.default.user.findUnique({
            where: {
                email: email,
                password: password, // TODO : hash it, 
            },
            select: {
                id: true,
                name: true
            }
        });
        if (!user) {
            return res.json({ message: "No user found !!. Please fill correctly or sign up online" }).status(403);
        }
        const pr = yield db_1.default.pullRequest.findUnique({
            where: {
                id: prid
            },
            select: {
                repositoryName: true,
                parentBranch: true,
                childBranch: true,
                creatorId: true
            }
        });
        if (!(pr === null || pr === void 0 ? void 0 : pr.creatorId)) {
            return res.json({ message: "No such user exists" });
        }
        else if (pr.creatorId !== user.id) {
            return res.json({ message: "You cannot merge it. Ask the administrator to merge it!!" });
        }
        else if (pr) {
            const url = yield (0, url_1.getPrDownloadUrl)(user.id, prid, pr.repositoryName);
            const parentBranch = pr.parentBranch;
            const childBranch = pr.childBranch;
            yield db_1.default.pullRequest.delete({
                where: {
                    id: prid
                }
            });
            return res.json({ message: url, parentBranch, childBranch });
        }
        else {
            return res.json({ message: `No pull request - ${prid} exists`, status: 400 });
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Enter properly all fields" });
        }
        //@ts-ignore
        if (error.code === "P2002") {
            return res.json({ message: "Please enter a unique repo name" }).status(500);
        }
        return res.json({ message: error, status: 500 }).status(500);
    }
}));
app.post("/pull", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reponame } = req.body;
    if (!reponame || reponame.length < 6) {
        return res.json({ message: `Reponame - ${reponame} is too short`, status: 400 }).status(400);
    }
    const repository = yield db_1.default.repositories.findUnique({
        where: {
            name: reponame
        },
        select: {
            userId: true
        }
    });
    if (repository) {
        const url = yield (0, url_1.getPullRequestPreAssingedUrl)(reponame, repository === null || repository === void 0 ? void 0 : repository.userId);
        return res.json({ message: url });
    }
    return res.json({ message: `No repository with name - ${reponame} found !! `, status: 400 }).status(400);
}));
app.post("/fork", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, name } = req.body;
        const forkUrl = yield (0, url_1.getPrDownloadUrlFork)(userID, name);
        return res.json({ message: forkUrl, status: 200 });
    }
    catch (error) {
        return res.json({ message: "error forking", status: 500 });
    }
}));
app.get("/", (req, res) => {
    return res.json({ message: "Hello" });
});
app.get("/post", (req, res) => {
    const { usename, password } = req.body;
    return res.json({ message: usename, password });
});
app.listen(3000, () => console.log("Server started"));
