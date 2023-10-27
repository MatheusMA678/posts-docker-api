"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.listUsers = exports.createUser = void 0;
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const userSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    username: zod_1.z.string(),
    image_url: zod_1.z.string().optional()
});
async function createUser(req, res) {
    const { email, password, username, image_url } = userSchema.parse(await req.body);
    const hashedPassword = await (0, bcrypt_1.hash)(password, 8);
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email
        }
    });
    if (user) {
        return res.status(409).json({
            message: "Já existe um usuário com este email.",
            success: false
        });
    }
    await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            image_url
        }
    });
    return res.status(201).end();
}
exports.createUser = createUser;
async function listUsers(req, res) {
    const users = await prisma_1.prisma.user.findMany({
        include: {
            posts: true
        }
    });
    return res.json(users);
}
exports.listUsers = listUsers;
async function login(req, res) {
    const { email, password } = userSchema.omit({ image_url: true, username: true }).parse(req.body);
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        return res.status(404).json({
            message: "Usuário não encontrado.",
            success: false
        });
    }
    const isSamePassword = await (0, bcrypt_1.compare)(password, user.password);
    if (!isSamePassword) {
        return res.status(401).json({
            message: "Senha incorreta.",
            success: false
        });
    }
    const token = jsonwebtoken_1.default.sign({
        sub: user.id,
        email: user.email
    }, process.env.JWT_SECRET);
    if (!token) {
        return res.status(500).json({
            message: "Erro ao criar o token.",
            success: false
        });
    }
    return res.status(200).json({
        token,
        success: true
    });
}
exports.login = login;
