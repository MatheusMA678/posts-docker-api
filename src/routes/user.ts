import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { exclude } from "../utils/prisma-exclude";

export async function getUser(req: Request, res: Response) {
  const id = (req as unknown as { userId: string }).userId

  const user = await prisma.user.findUnique({
    where: {
      id
    },
    include: {
      posts: true
    }
  })

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado.",
      success: false
    })
  }

  const userWithoutPassword = exclude(user, ['password'])

  return res.json(userWithoutPassword)
}