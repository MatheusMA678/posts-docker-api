import { Request, Response } from "express";
import { z } from 'zod'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'

import { prisma } from "../lib/prisma";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z.string(),
  image_url: z.string().optional()
})

export async function createUser(req: Request, res: Response) {
  const { email, password, username, image_url } = userSchema.parse(await req.body)

  const hashedPassword = await hash(password, 8)

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (user) {
    return res.status(409).json({
      message: "Já existe um usuário com este email.",
      success: false
    })
  }

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      image_url
    }
  })

  return res.status(201).end()
}

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      password: false,
      image_url: true,
      created_at: true,
      posts: true
    }
  })

  return res.json(users)
}

export async function login(req: Request, res: Response) {
  const { email, password } = userSchema.omit({ image_url: true, username: true }).parse(req.body)

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado.",
      success: false
    })
  }

  const isSamePassword = await compare(password, user.password)

  if (!isSamePassword) {
    return res.status(401).json({
      message: "Senha incorreta.",
      success: false
    })
  }

  const token = jwt.sign({
    sub: user.id,
    email: user.email
  }, process.env.JWT_SECRET!)

  if (!token) {
    return res.status(500).json({
      message: "Erro ao criar o token.",
      success: false
    })
  }

  return res.status(200).json({
    token,
    success: true
  })
}

export async function updateUser(req: Request, res: Response) {
  const id = (req as unknown as { userId: string }).userId
  const { username, image_url } = userSchema.partial().parse(req.body)

  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado.",
      success: false
    })
  }

  try {
    await prisma.user.update({
      where: {
        id
      },
      data: {
        username,
        image_url
      }
    })

    return res.status(200).json({
      message: "Usuário atualizado.",
      success: true
    })
  } catch(error) {
    return res.status(500).json({
      error,
      message: "Ocorreu um erro ao atualizar o usuário.",
      success: false
    })
  }
}