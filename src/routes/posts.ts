import { Request, Response } from "express";
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { slugify } from "../utils/slugify";

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
})

export async function createPost(req: Request, res: Response) {
  const { title, description } = postSchema.parse(await req.body)

  const slug = slugify(title)

  const post = await prisma.post.findUnique({
    where: {
      slug
    }
  })

  if (post) {
    return res.status(409).json({
      message: "Postagem já existente.",
      success: false
    })
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      description,
      user: {
        connect: {
          id: (req as unknown as { userId: string }).userId
        }
      }
    }
  })

  return res.status(201).end()
}

export async function listPosts(req: Request, res: Response) {
  const posts = await prisma.post.findMany()

  return res.json(posts)
}