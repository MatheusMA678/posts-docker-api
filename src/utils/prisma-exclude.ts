import { User } from '@prisma/client'

type Key = keyof User

export function exclude(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key as Key))
  )
}