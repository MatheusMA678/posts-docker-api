"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPosts = exports.createPost = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const slugify_1 = require("../utils/slugify");
const postSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
});
async function createPost(req, res) {
    const { title, description } = postSchema.parse(await req.body);
    const slug = (0, slugify_1.slugify)(title);
    const post = await prisma_1.prisma.post.findUnique({
        where: {
            slug
        }
    });
    if (post) {
        return res.status(409).json({
            message: "Postagem já existente.",
            success: false
        });
    }
    await prisma_1.prisma.post.create({
        data: {
            title,
            slug,
            description,
            user: {
                connect: {
                    id: req.userId
                }
            }
        }
    });
    return res.status(201).end();
}
exports.createPost = createPost;
async function listPosts(req, res) {
    const posts = await prisma_1.prisma.post.findMany();
    return res.json(posts);
}
exports.listPosts = listPosts;
